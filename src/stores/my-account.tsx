import Toast from '@/components/Toast'
import { getReferralIdInUrl } from '@/components/referral/ReferralUrlChanger'
import { sendEventWithRef } from '@/components/referral/analytics'
import { IdentityProvider } from '@/services/datahub/generated-query'
import { linkIdentity } from '@/services/datahub/identity/mutation'
import { getLinkedIdentityQuery } from '@/services/datahub/identity/query'
import { getReferrerIdQuery } from '@/services/datahub/referral/query'
import { queryClient } from '@/services/provider'
import { useParentData } from '@/stores/parent'
import {
  Signer,
  decodeSecretKey,
  encodeSecretKey,
  generateAccount,
  isSecretKeyUsingMiniSecret,
  loginWithSecretKey,
} from '@/utils/account'
import { LocalStorage, LocalStorageAndForage } from '@/utils/storage'
import { isWebNotificationsEnabled } from '@/utils/window'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { UserProperties, useAnalytics } from './analytics'
import { create, createSelectors } from './utils'

type State = {
  /**
   * `isInitialized` is `true` when the addresses (address & parentProxyAddress) are all set
   * but there is still a case where the proxy is invalid and user will be logged out after that
   */
  isInitialized: boolean | undefined
  /**
   * `isInitializedAddress` is `true` if the current address is result of initialization process (user is not just logged in)
   */
  isInitializedAddress: boolean | undefined
  /**
   * `isInitializedProxy` is `true` when the initialization process is all done, including checking the proxy
   */
  isInitializedProxy: boolean | undefined
  isTemporaryAccount: boolean

  parentProxyAddress: string | undefined

  address: string | null
  signer: Signer | null
  encodedSecretKey: string | null
}

type Actions = {
  login: (
    secretKey?: string,
    config?: {
      isInitialization?: boolean
      asTemporaryAccount?: boolean
      withErrorToast?: boolean
    }
  ) => Promise<string | false>
  loginAsTemporaryAccount: () => Promise<string | false>
  finalizeTemporaryAccount: () => void
  logout: () => void
  saveProxyAddress: (address: string) => void
  disconnectProxy: () => void
}

const initialState: State = {
  isInitialized: undefined,
  isInitializedAddress: true,
  isInitializedProxy: false,
  isTemporaryAccount: false,
  parentProxyAddress: undefined,
  address: null,
  signer: null,
  encodedSecretKey: null,
}

export const accountAddressStorage = new LocalStorageAndForage(
  () => 'accountPublicKey'
)
export const followedIdsStorage = new LocalStorageAndForage(
  (address: string) => `followedPostIds:${address}`
)
export const hasSentMessageStorage = new LocalStorage(() => 'has-sent-message')
const accountStorage = new LocalStorage(() => 'account')
const temporaryAccountStorage = new LocalStorage(() => 'temp-account')
const parentProxyAddressStorage = new LocalStorage(
  () => 'connectedWalletAddress'
)

const sendLaunchEvent = async (
  address?: string | false,
  parentProxyAddress?: string | null
) => {
  let userProperties: UserProperties = {
    tgNotifsConnected: false,
    evmLinked: false,
    polkadotLinked: !!parentProxyAddress,
    webNotifsEnabled: false,
    ownedChat: false,
  }

  const sendEvent = useAnalytics.getState().sendEvent

  if (!address) {
    sendEvent('app_launched', undefined, { ref: getReferralIdInUrl() })
  } else {
    const [
      // linkedTgAccData,
      linkedIdentity,
      referrerId,
    ] = await Promise.allSettled([
      // getLinkedTelegramAccountsQuery.fetchQuery(queryClient, {
      //   address,
      // }),
      getLinkedIdentityQuery.fetchQuery(queryClient, address),
      getReferrerIdQuery.fetchQuery(queryClient, address),
    ] as const)

    // if (linkedTgAccData.status === 'fulfilled')
    //   userProperties.tgNotifsConnected =
    //     (linkedTgAccData.value?.length || 0) > 0
    if (linkedIdentity.status === 'fulfilled')
      userProperties.twitterLinked =
        !!linkedIdentity.value?.externalProviders.find(
          (el) => el.provider === IdentityProvider.Twitter
        )
    if (referrerId.status === 'fulfilled')
      userProperties.ref = referrerId.value || getReferralIdInUrl()

    userProperties.webNotifsEnabled = isWebNotificationsEnabled()

    sendEvent('app_launched', undefined, userProperties)
  }
}

const useMyAccountBase = create<State & Actions>()((set, get) => ({
  ...initialState,
  saveProxyAddress: (address) => {
    parentProxyAddressStorage.set(address)
    set({ parentProxyAddress: address })
  },
  disconnectProxy: () => {
    set({ parentProxyAddress: undefined })
    parentProxyAddressStorage.remove()
  },
  login: async (secretKey, config) => {
    const {
      asTemporaryAccount,
      isInitialization,
      withErrorToast = true,
    } = config || {}
    const analytics = useAnalytics.getState()
    let address: string = ''
    try {
      if (!secretKey) {
        secretKey = (await generateAccount()).secretKey
        const { parentOrigin } = useParentData.getState()
        sendEventWithRef(address, (refId) => {
          analytics.sendEvent(
            'account_created',
            {},
            {
              cameFrom: parentOrigin,
              cohortDate: dayjs().toDate(),
              ref: refId,
            }
          )
        })
      } else if (secretKey.startsWith('0x')) {
        const augmented = secretKey.substring(2)
        if (isSecretKeyUsingMiniSecret(augmented)) {
          secretKey = augmented
        }
      }

      const signer = await loginWithSecretKey(secretKey)
      const encodedSecretKey = encodeSecretKey(secretKey)
      address = signer.address

      set({
        address,
        signer,
        encodedSecretKey,
        isInitializedAddress: !!isInitialization,
      })

      if (asTemporaryAccount) {
        temporaryAccountStorage.set(encodedSecretKey)
      } else saveLoginInfoToStorage()

      if (!isInitialization) {
        const parentProxyAddress = await getParentProxyAddress(address)
        if (parentProxyAddress) {
          parentProxyAddressStorage.set(parentProxyAddress)
          set({ parentProxyAddress })
          await validateParentProxyAddress({
            grillAddress: address,
            parentProxyAddress,
            onInvalidProxy: () => {
              get().logout()
              toast.custom((t) => (
                <Toast
                  t={t}
                  type='error'
                  title='Login failed'
                  subtitle='You seem to have logged in to your wallet in another device, please relogin using "Connect via Polkadot" to use it here'
                />
              ))
            },
          })
        }
      }
    } catch (e) {
      console.error('Failed to login', e)
      if (!isInitialization && withErrorToast) {
        toast.custom((t) => (
          <Toast
            t={t}
            type='error'
            title='Login Failed'
            description='The Grill key you provided is not valid'
          />
        ))
      }
      return false
    }
    return get().parentProxyAddress || get().address || false
  },
  loginAsTemporaryAccount: async () => {
    set({ isTemporaryAccount: true })
    const encodedTempAcc = temporaryAccountStorage.get()
    let tempAcc = undefined
    if (encodedTempAcc) tempAcc = decodeSecretKey(encodedTempAcc)

    const res = await get().login(tempAcc, {
      asTemporaryAccount: true,
    })
    if (!res) temporaryAccountStorage.remove()

    return res
  },
  finalizeTemporaryAccount: () => {
    saveLoginInfoToStorage()
    temporaryAccountStorage.remove()
    set({ isTemporaryAccount: false })
  },
  logout: () => {
    const { address } = get()

    accountStorage.remove()
    accountAddressStorage.remove()
    hasSentMessageStorage.remove()
    parentProxyAddressStorage.remove()
    if (address) followedIdsStorage.remove(address)

    set({ ...initialState, isInitialized: true, isInitializedProxy: true })
  },
  init: async () => {
    const { isInitialized, login } = get()

    // Prevent multiple initialization
    if (isInitialized !== undefined) return
    set({ isInitialized: false })

    const encodedSecretKey = accountStorage.get()
    const parentProxyAddressFromStorage = parentProxyAddressStorage.get()

    if (encodedSecretKey) {
      const storageAddress = accountAddressStorage.get()
      set({ address: storageAddress || undefined })

      const secretKey = decodeSecretKey(encodedSecretKey)
      const address = await login(secretKey, { isInitialization: true })

      if (!address) {
        accountStorage.remove()
        accountAddressStorage.remove()
        set({ address: null })
      }

      sendLaunchEvent(address, parentProxyAddressFromStorage)
    } else {
      sendLaunchEvent()
    }

    const address = get().address
    const parentProxyAddress =
      parentProxyAddressFromStorage ||
      (address ? await getParentProxyAddress(address) : undefined)

    set({
      isInitialized: true,
      parentProxyAddress: parentProxyAddress ?? undefined,
    })

    if (parentProxyAddress) {
      await validateParentProxyAddress({
        grillAddress: get().address!,
        parentProxyAddress,
        onInvalidProxy: () => {
          get().logout()
          toast.custom((t) => (
            <Toast
              t={t}
              type='error'
              title='Logged out'
              subtitle='You seem to have logged in to your wallet in another device, please relogin to use it here'
            />
          ))
        },
      })
    }
    set({ isInitializedProxy: true })

    // if we use parentProxy from storage, then need to check whether the account is linked in datahub or not, and link if not yet
    // this is a background process, so it needs to be done after all other init is done
    const finalAddress = get().address
    const finalParentProxyAddress = get().parentProxyAddress
    if (finalAddress && finalParentProxyAddress) {
      linkPolkadotIfNotLinked(finalAddress, finalParentProxyAddress)
    }
  },
}))
export const useMyAccount = createSelectors(useMyAccountBase)

async function linkPolkadotIfNotLinked(
  address: string,
  parentProxyAddress: string
) {
  const linkedAddress = await getParentProxyAddress(address)
  if (linkedAddress ?? ''! === parentProxyAddress!) return

  try {
    await linkIdentity({
      address,
      args: {
        id: parentProxyAddress,
        // @ts-expect-error because using IdentityProvider from generated types, but its same with the datahub sdk
        provider: IdentityProvider.Polkadot,
      },
    })
    if (queryClient) getLinkedIdentityQuery.invalidate(queryClient, address)
  } catch (err) {
    console.error('Failed to link polkadot identity', err)
  }
}

async function validateParentProxyAddress({
  grillAddress,
  parentProxyAddress,
  onInvalidProxy,
}: {
  parentProxyAddress: string
  grillAddress: string
  onInvalidProxy: () => void
}) {
  try {
    // Remove proxy with type 'Any'
    const currentProxy = await getParentProxyAddress(grillAddress)
    if (!currentProxy || currentProxy !== parentProxyAddress) {
      onInvalidProxy()
    }
  } catch (err) {
    console.error('Failed to fetch proxies', err)
  }
}

async function getParentProxyAddress(grillAddress: string) {
  try {
    const linkedIdentity = await getLinkedIdentityQuery.fetchQuery(
      queryClient,
      grillAddress
    )
    return linkedIdentity?.mainAddress
  } catch (err) {
    console.error('Failed to get linked identity')
    return null
  }
}

function saveLoginInfoToStorage() {
  const { address, encodedSecretKey, signer } = useMyAccount.getState()
  if (!address || !encodedSecretKey || !signer) return
  accountStorage.set(encodedSecretKey)
  accountAddressStorage.set(address)

  useAnalytics.getState().setUserId(signer.address)
}

export function getMyMainAddress() {
  const { address, parentProxyAddress } = useMyAccount.getState()
  return parentProxyAddress || address
}

export function useMyMainAddress() {
  // const address = useMyAccount((state) => state.address)
  // const parentProxyAddress = useMyAccount((state) => state.parentProxyAddress)
  // return parentProxyAddress || address

  return '3rSaMDDFoqsduRDxcAidDX4hx6zKhFaTFmbpJtxyT8QK4hib'
}

export function useMyGrillAddress() {
  return useMyAccount((state) => state.address)
}

export function getIsLoggedIn() {
  return !!accountStorage.get()
}
