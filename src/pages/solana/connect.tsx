import Button from '@/components/Button'
import { env } from '@/env.mjs'
import { addExternalProviderToIdentity } from '@/server/datahub-queue/identity'
import { createSocialDataEventPayload } from '@/services/datahub/utils'
import { decryptPayload } from '@/stores/encryption'
import { decodeSecretKey, loginWithSecretKey } from '@/utils/account'
import { getCommonServerSideProps } from '@/utils/page'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import bs58 from 'bs58'
import nacl from 'tweetnacl'

export const getServerSideProps = getCommonServerSideProps(
  {},
  async (context) => {
    const message = context.query.message as string
    const solanaAddress = context.query.solana_address as string
    const address = context.query.address as string
    const signerKey = context.query.signer as string
    const signerNonce = context.query.signer_nonce as string
    const nonce = context.query.nonce as string
    const data = context.query.data as string
    const phantomEncryptionPublicKey = context.query
      .phantom_encryption_public_key as string

    const sharedSecretDapp = nacl.box.before(
      bs58.decode(phantomEncryptionPublicKey),
      bs58.decode(env.DAPP_SECRET_KEY)
    )
    const decryptedSigData = decryptPayload(data, nonce, sharedSecretDapp) as {
      signature: string
    }
    const decryptRes = nacl.secretbox.open(
      Buffer.from(signerKey, 'hex') as unknown as Uint8Array,
      bs58.decode(signerNonce),
      bs58.decode(env.DAPP_SECRET_KEY)
    )

    if (!decryptRes) {
      return {
        redirect: {
          destination: '/tg',
          permanent: false,
        },
      }
    }

    const secretKey = decodeSecretKey(Buffer.from(decryptRes).toString())
    const signer = await loginWithSecretKey(secretKey)
    await addExternalProviderToIdentity(
      await createSocialDataEventPayload(
        'synth_add_linked_identity_external_provider',
        {
          address: signer.address,
          proxyToAddress: address,
          timestamp: Date.now(),
        },
        {
          externalProvider: {
            id: solanaAddress,
            provider: IdentityProvider.SOLANA,
            solProofMsg: message,
            solProofMsgSig: decryptedSigData.signature,
          },
        }
      )
    )

    return {
      props: {
        solanaAddress,
        address,
      },
    }
  }
)

export default function SolanaConnectPage({
  solanaAddress,
}: {
  solanaAddress: string
  address: string
}) {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center text-center'>
      <h1 className='text-2xl font-bold'>
        Your Solana Address Successfully Linked 🎉
      </h1>
      <p className='mt-3 text-text-muted'>
        Your Solana address: {solanaAddress}
      </p>

      <Button
        className='mt-6'
        size='lg'
        href={`https://t.me/${'Telebot123botbot'}`}
      >
        Back to Epic
      </Button>
    </div>
  )
}
