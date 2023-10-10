import { generatePromiseQueue } from '@/utils/promise'
import type { ApiPromise } from '@polkadot/api'
import type { SubsocialApi, SubsocialIpfsApi } from '@subsocial/api'
import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { makeCombinedCallback } from '../base'
import { getConnectionConfig, getGlobalTxCallbacks } from './config'
import { getSubstrateHttpApi } from './connection'
import {
  CallbackData,
  SubsocialMutationConfig,
  Transaction,
  WalletAccount,
} from './types'
import { getBlockExplorerBlockInfoLink } from './utils'

type Apis = {
  subsocialApi: SubsocialApi
  ipfsApi: SubsocialIpfsApi
  substrateApi: ApiPromise
  useHttp: boolean
}

type TransactionGenerator<Data, Context> = (params: {
  data: Data
  context: Context
  apis: Apis
  wallet: WalletAccount
}) => Promise<{ tx: Transaction; summary: string }>
export function useSubsocialMutation<Data, Context = undefined>(
  {
    getWallet,
    generateContext,
    transactionGenerator,
  }: {
    getWallet: () => Promise<WalletAccount> | WalletAccount
    generateContext: Context extends undefined
      ? undefined
      : (data: Data, wallet: WalletAccount) => Promise<Context> | Context
    transactionGenerator: TransactionGenerator<Data, Context>
  },
  config?: SubsocialMutationConfig<Data, Context>,
  defaultConfig?: SubsocialMutationConfig<Data, Context>
): UseMutationResult<string, Error, Data, unknown> {
  const workerFunc = async (data: Data) => {
    const wallet = await getWallet()
    if (!wallet.address || !wallet.signer)
      throw new Error('You need to connect your wallet first!')

    const context = (await generateContext?.(data, wallet)) as Context

    const txCallbacks = generateTxCallbacks(
      {
        address: wallet.address,
        data,
        context,
      },
      config?.txCallbacks,
      defaultConfig?.txCallbacks
    )
    txCallbacks?.onStart()

    const { getSubsocialApi } = await import('./connection')

    const subsocialApi = await getSubsocialApi()
    const useHttp = config?.useHttp || defaultConfig?.useHttp
    let substrateApi: ApiPromise
    if (useHttp) {
      substrateApi = await getSubstrateHttpApi()
    } else {
      substrateApi = await subsocialApi.substrateApi
    }

    if (!substrateApi.isConnected) {
      // try reconnecting, if it fails, it will throw an error
      try {
        await substrateApi.disconnect()
        await substrateApi.connect()
      } catch (err) {
        throw new Error(`Failed to reconnect to the Substrate node: ${err}`)
      }
    }

    const ipfsApi = subsocialApi.ipfs

    const supressTxSendingError =
      config?.supressTxSendingError || defaultConfig?.supressTxSendingError
    try {
      return await createTxAndSend(
        transactionGenerator,
        data,
        context,
        { subsocialApi, substrateApi, ipfsApi, useHttp: !!useHttp },
        {
          wallet,
          networkRpc: getConnectionConfig().substrateUrl,
          supressTxSendingError,
        },
        txCallbacks
      )
    } catch (e) {
      txCallbacks?.onError(
        (e as any)?.message || 'Error when sending transaction'
      )
      throw e
    }
  }

  return useMutation(workerFunc, {
    ...(defaultConfig || {}),
    ...config,
    onSuccess: makeCombinedCallback(defaultConfig, config, 'onSuccess'),
    onError: makeCombinedCallback(defaultConfig, config, 'onError'),
  })
}

async function createTxAndSend<Data, Context>(
  transactionGenerator: TransactionGenerator<Data, Context>,
  data: Data,
  context: Context,
  apis: Apis,
  txConfig: {
    supressTxSendingError?: boolean
    wallet: WalletAccount
    networkRpc?: string
  },
  txCallbacks?: ReturnType<typeof generateTxCallbacks>
) {
  const { tx, summary } = await transactionGenerator({
    data,
    apis,
    wallet: txConfig.wallet,
    context,
  })
  try {
    return await sendTransaction(
      {
        tx,
        wallet: txConfig.wallet,
        data,
        networkRpc: txConfig.networkRpc,
        summary,
      },
      apis,
      txCallbacks
    )
  } catch (err) {
    txCallbacks?.onErrorBlockchain(
      (err as any).message || 'Error processing transaction'
    )
    if (txConfig.supressTxSendingError) {
      console.warn('Error supressed when sending tx: ', err)
      return ''
    }
    throw err
  }
}
function sendTransaction<Data>(
  txInfo: {
    tx: Transaction
    summary: string
    wallet: WalletAccount
    data: Data
    networkRpc: string | undefined
  },
  apis: Apis,
  txCallbacks?: ReturnType<typeof generateTxCallbacks>
) {
  const {
    networkRpc,
    data,
    summary,
    tx,
    wallet: { address, signer },
  } = txInfo
  const globalTxCallbacks = getGlobalTxCallbacks()
  return new Promise<string>(async (resolve, reject) => {
    let danglingNonceResolver: undefined | (() => void)
    try {
      const { nonce, nonceResolver } = await getNonce(
        apis.substrateApi,
        address
      )
      danglingNonceResolver = nonceResolver

      const signature = await tx.signAsync(signer, { nonce })
      const txSig = signature.toHex()

      async function sendTx() {
        try {
          const unsub = await signature.send(async (result) => {
            // the result is only tx hash if its using http connection
            if (typeof result.toHuman() === 'string') {
              return resolve(result.toString())
            }

            resolve(result.txHash.toString())
            if (result.status.isInvalid) {
              txCallbacks?.onErrorBlockchain('Transaction is invalid')
              globalTxCallbacks.onError({
                summary,
                address,
                data,
              })
            } else if (result.status.isBroadcast) {
              txCallbacks?.onBroadcast()
              globalTxCallbacks.onBroadcast({
                summary,
                data,
                address,
              })
            } else if (result.status.isInBlock) {
              const blockHash = (result.status.toJSON() ?? ({} as any)).inBlock
              let explorerLink: string | undefined
              if (networkRpc) {
                explorerLink = getBlockExplorerBlockInfoLink(
                  networkRpc,
                  blockHash
                )
              }
              if (
                result.isError ||
                result.dispatchError ||
                result.internalError
              ) {
                const error = result.dispatchError?.toString()
                txCallbacks?.onErrorBlockchain(
                  error || 'Error when executing transaction'
                )
                globalTxCallbacks.onError({
                  error,
                  summary,
                  address,
                  data,
                  explorerLink,
                })
              } else {
                txCallbacks?.onSuccess(result)
                globalTxCallbacks.onSuccess({
                  explorerLink,
                  summary,
                  address,
                  data,
                })
              }
              unsub()
            }
          })
          nonceResolver()
          txCallbacks?.onSend()
          globalTxCallbacks.onSuccess({
            summary,
            address,
            data,
          })
        } catch (err) {
          nonceResolver()
          txCallbacks?.onErrorBlockchain(
            (err as any).message || 'Error sending to blockchain'
          )
          throw err
        }
      }

      if (!txCallbacks?.onBeforeSend) {
        await sendTx()
        return
      }

      // only throw error if both onBeforeSend and sendTx fail
      // this is for "previous" datahub implementation, so its only showing error to use if:
      // datahub and blockchain sending both failed
      const promises = [txCallbacks?.onBeforeSend(txSig), sendTx()]
      const res = await Promise.allSettled(promises)
      if (res[0].status === 'rejected' && res[1].status === 'rejected') {
        throw res[0].reason
      }
    } catch (e) {
      danglingNonceResolver?.()
      reject(e)
    }
  })
}

const noncePromise = generatePromiseQueue()
/**
 * This function is used to get nonce for the next transaction, and wait until the previous transaction is sent.
 * You need to call `nonceResolver()` after you send the transaction.
 * @param substrateApi Substrate API
 * @param address Address of the account
 */
async function getNonce(substrateApi: ApiPromise, address: string) {
  const previousQueue = noncePromise.addQueue()

  return new Promise<{ nonce: number; nonceResolver: () => void }>(
    (resolve, reject) => {
      async function getNonce() {
        try {
          const timeoutId = setTimeout(() => {
            reject(
              new Error('Timeout: Cannot get nonce for the next transaction.')
            )
          }, 10_000)

          await previousQueue
          const nonce = await substrateApi.rpc.system.accountNextIndex(address)
          resolve({
            nonce: nonce.toNumber(),
            nonceResolver: noncePromise.resolveQueue,
          })

          clearTimeout(timeoutId)
        } catch (err) {
          console.log('Error getting nonce', err)
          reject(new Error('Failed to get nonce'))
        }
      }
      getNonce()
    }
  )
}

function generateTxCallbacks<Data, Context>(
  data: CallbackData<Data, Context>,
  callbacks: SubsocialMutationConfig<Data, Context>['txCallbacks'],
  defaultCallbacks: SubsocialMutationConfig<Data, Context>['txCallbacks']
) {
  if (!callbacks && !defaultCallbacks) return
  return {
    onError: (error: string) =>
      makeCombinedCallback(defaultCallbacks, callbacks, 'onError')(data, error),
    onBroadcast: () =>
      makeCombinedCallback(defaultCallbacks, callbacks, 'onBroadcast')(data),
    onSuccess: (txResult: any) =>
      makeCombinedCallback(
        defaultCallbacks,
        callbacks,
        'onSuccess'
      )(data, txResult),
    onBeforeSend: async (txSig: string) => {
      try {
        await defaultCallbacks?.onBeforeSend?.(data, txSig)
        await callbacks?.onBeforeSend?.(data, txSig)
      } catch (err) {
        throw err
      }
    },
    onSend: () =>
      makeCombinedCallback(defaultCallbacks, callbacks, 'onSend')(data),
    onStart: () =>
      makeCombinedCallback(defaultCallbacks, callbacks, 'onStart')(data),
    onErrorBlockchain: (error: string) =>
      makeCombinedCallback(
        defaultCallbacks,
        callbacks,
        'onErrorBlockchain'
      )(data, error),
  }
}
