import {
  decodeSecretKey,
  encodeSecretKey,
  loginWithSecretKey,
  Signer,
} from '@/utils/account'
import { useAnalytics } from './analytics'
import { create } from './utils'

type State = {
  isInitialized?: boolean
  isInitializedAddress?: boolean
  address: string | null
  signer: Signer | null
  energy: number | null
  unsubscribeEnergy: () => void
  encodedSecretKey: string | null
}
type Actions = {
  login: (secretKey: string, isInitialization?: boolean) => Promise<boolean>
  logout: () => void
  subscribeEnergy: () => Promise<void>
}

const STORAGE_KEY = 'account'

const initialState = {
  isInitializedAddress: true,
  address: null,
  signer: null,
  energy: null,
  unsubscribeEnergy: () => undefined,
  encodedSecretKey: null,
}
export const useMyAccount = create<State & Actions>()((set, get) => ({
  ...initialState,
  login: async (secretKey: string, isInitialization?: boolean) => {
    try {
      const signer = await loginWithSecretKey(secretKey)
      const encodedSecretKey = encodeSecretKey(secretKey)
      set({
        address: signer.address,
        signer,
        encodedSecretKey,
        isInitializedAddress: !!isInitialization,
      })
      localStorage.setItem(STORAGE_KEY, encodedSecretKey)
      get().subscribeEnergy()
      useAnalytics.getState().setUserId(signer.address)
    } catch (e) {
      console.log('Failed to login', e)
      return false
    }
    return true
  },
  subscribeEnergy: async () => {
    const { address, unsubscribeEnergy } = get()
    unsubscribeEnergy()
    if (!address) return

    const { getSubsocialApi } = await import(
      '@/subsocial-query/subsocial/connection'
    )

    const subsocialApi = await getSubsocialApi()
    const substrateApi = await subsocialApi.substrateApi
    const unsub = substrateApi.query.energy.energyBalance(
      address,
      (energyAmount) => {
        const parsedEnergy = parseFloat(energyAmount.toPrimitive().toString())
        set({
          energy: parsedEnergy,
          unsubscribeEnergy: () => unsub.then((unsub) => unsub()),
        })
      }
    )
  },
  logout: () => {
    const { unsubscribeEnergy, isInitialized } = get()
    unsubscribeEnergy()

    localStorage.removeItem(STORAGE_KEY)
    set(initialState)

    if (isInitialized) {
      useAnalytics.getState().removeUserId()
    }
  },
  init: async () => {
    const { isInitialized, login } = get()

    // Prevent multiple initialization
    if (isInitialized !== undefined) return
    set({ isInitialized: false })

    const encodedSecretKey = localStorage.getItem(STORAGE_KEY)
    if (encodedSecretKey) {
      const secretKey = decodeSecretKey(encodedSecretKey)
      await login(secretKey, true)
    }
    set({ isInitialized: true })
  },
}))
