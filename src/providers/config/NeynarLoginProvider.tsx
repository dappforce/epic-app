import { env } from '@/env.mjs'
import useWrapInRef from '@/hooks/useWrapInRef'
import {
  useAddExternalProviderToIdentity,
  useLinkIdentity,
} from '@/services/datahub/identity/mutation'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { useSubscriptionState } from '@/stores/subscription'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import Script from 'next/script'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react'

declare global {
  interface Window {
    onSignInSuccess?: (data: { signer_uuid: string; fid: string }) => void
  }
}

type State = {
  loginNeynar: () => void
  isLoadingOrSubmitted: boolean
}
const NeynarLoginContext = createContext<State>({
  loginNeynar: () => {
    throw new Error('loginNeynar not implemented')
  },
  isLoadingOrSubmitted: false,
})

export default function NeynarLoginProvider({
  children,
}: {
  children: ReactNode
}) {
  const loginAsTemporaryAccount = useMyAccount.use.loginAsTemporaryAccount()
  const finalizeTemporaryAccount = useMyAccount.use.finalizeTemporaryAccount()

  const {
    mutate: addExternalProvider,
    isSuccess: isSuccessAdding,
    isLoading: isAddingProvider,
    reset: resetAdding,
  } = useAddExternalProviderToIdentity()
  const {
    mutate: linkIdentity,
    isSuccess: isSuccessLinking,
    isLoading: isLinking,
    reset: resetLinking,
  } = useLinkIdentity({
    onSuccess: () => {
      finalizeTemporaryAccount()
    },
  })
  const isLoading = isLinking || isAddingProvider
  const isSuccess = isSuccessLinking || isSuccessAdding

  const isLoadingRef = useWrapInRef(isLoading)

  const mainAddress = useMyMainAddress()
  useEffect(() => {
    if (!mainAddress) {
      resetAdding()
      resetLinking()
    }
  }, [mainAddress, resetLinking, resetAdding])

  useEffect(() => {
    window.onSignInSuccess = async (data) => {
      useSubscriptionState
        .getState()
        .setSubscriptionState('identity', 'always-sub')
      if (isLoadingRef.current) return

      let currentAddress = useMyAccount.getState().address
      if (currentAddress) {
        addExternalProvider({
          externalProvider: {
            provider: IdentityProvider.FARCASTER,
            id: data.fid,
            farcasterSignerUuid: data.signer_uuid,
          },
        })
      } else {
        const address = await loginAsTemporaryAccount()
        if (!address) {
          console.error('Failed to login account')
          return
        }

        linkIdentity({
          externalProvider: {
            provider: IdentityProvider.FARCASTER,
            id: data.fid,
            farcasterSignerUuid: data.signer_uuid,
          },
        })
      }
    }

    return () => {
      delete window.onSignInSuccess
    }
  }, [loginAsTemporaryAccount, linkIdentity, isLoadingRef, addExternalProvider])

  const loginNeynar = useCallback(() => {
    const loginBtnContainer = document.getElementById('neynar_signin')
    const loginBtn = loginBtnContainer?.querySelector('button')
    loginBtn?.click()
  }, [])

  return (
    <NeynarLoginContext.Provider
      value={{ loginNeynar, isLoadingOrSubmitted: isSuccess || isLoading }}
    >
      <Script src='https://neynarxyz.github.io/siwn/raw/1.2.0/index.js' defer />
      <div
        id='neynar_signin'
        className='neynar_signin pointer-events-none absolute opacity-0 [&>button]:!min-w-[auto]'
        data-client_id={env.NEXT_PUBLIC_NEYNAR_CLIENT_ID}
        data-height='38px'
        data-font_size='14px'
        data-border_radius='50px'
        data-logo_size='24px'
        data-width='190px'
        data-success-callback='onSignInSuccess'
        data-theme='dark'
        data-background_color='#4287f5'
      />
      {children}
    </NeynarLoginContext.Provider>
  )
}

export function useNeynarLogin() {
  return useContext(NeynarLoginContext)
}