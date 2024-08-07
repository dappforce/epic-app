import FarcasterIcon from '@/assets/icons/farcaster.svg'
import Button from '@/components/Button'
import InfoPanel from '@/components/InfoPanel'
import Logo from '@/components/Logo'
import { ModalFunctionalityProps } from '@/components/modals/Modal'
import { getReferralIdInUrl } from '@/components/referral/ReferralUrlChanger'
import { sendEventWithRef } from '@/components/referral/analytics'
import { useNeynarLogin } from '@/providers/config/NeynarLoginProvider'
import { useTelegramLogin } from '@/providers/config/TelegramLoginProvider'
import { Identity } from '@/services/datahub/identity/fetcher'
import { getProfileQuery } from '@/services/datahub/profiles/query'
import { useSetReferrerId } from '@/services/datahub/referral/mutation'
import { useSendEvent } from '@/stores/analytics'
import { useLoginModal } from '@/stores/login-modal'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { getUrlQuery } from '@/utils/links'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FaTelegramPlane } from 'react-icons/fa'
import { SiEthereum } from 'react-icons/si'
import { CommonEVMLoginContent } from '../common/evm/CommonEvmModalContent'
import ScanQRButton from './ScanQRButton'
import { AccountCreatedContent } from './contents/AccountCreatedContent'
import { LoginWithGrillKeyContent } from './contents/LoginWithGrillKeyContent'
import ScanQrContent from './contents/ScanQrContent'
import { GoogleButton, XLoginButton } from './contents/oauth-buttons'

export type LoginModalStep =
  | 'login'
  | 'scan-qr'
  | 'enter-secret-key'
  | 'account-created'
  | 'evm-address-link'
  | 'evm-linking-error'

export type LoginModalContentProps = ModalFunctionalityProps & {
  setCurrentState: Dispatch<SetStateAction<LoginModalStep>>
  currentStep: LoginModalStep
  afterLogin?: () => void
  beforeLogin?: () => void
}

export const LoginContent = (props: LoginModalContentProps) => {
  const { setCurrentState, closeModal } = props
  const finalizeTemporaryAccount = useMyAccount.use.finalizeTemporaryAccount()
  const sendEvent = useSendEvent()
  const { loginNeynar, isLoadingOrSubmitted: loadingNeynar } = useNeynarLogin()
  const { loginTelegram, isLoadingOrSubmitted: loadingTelegram } =
    useTelegramLogin()

  const onSuccess = (linkedIdentity: Identity) => {
    closeModal()
    // if (
    //   !linkedIdentity.externalProviders.find(
    //     (p) => p.provider === IdentityProvider.Evm
    //   )
    // ) {
    //   openNextStepModal({ step: 'connect-evm' })
    // }
  }

  const [showErrorPanel, setShowErrorPanel] = useState(false)
  useEffect(() => {
    const auth = getUrlQuery('auth') === 'true'
    const error = getUrlQuery('error')
    // if user denied access to twitter (has suspended account)
    if (auth && error?.toLowerCase() === 'oauthcallback')
      setShowErrorPanel(true)
  }, [])

  return (
    <div>
      <ScanQRButton {...props} />
      <div className='flex w-full flex-col justify-center'>
        <Logo className='mb-12 mt-6 text-4xl' />
        <div className={cx('flex flex-col gap-4')}>
          {showErrorPanel && (
            <InfoPanel variant='error' className='mb-4'>
              😕 Sorry there is some issue with logging you in, please try again
              or try different account
            </InfoPanel>
          )}
          <Button
            variant='primary'
            onClick={() => {
              sendEvent('login_evm_clicked')
              setCurrentState('evm-address-link')
            }}
            size='lg'
          >
            <div className='flex items-center justify-center gap-2'>
              <SiEthereum
                className={cx('text-xl text-text-muted-on-primary')}
              />
              Connect Wallet
            </div>
          </Button>
          <Button
            variant='primaryOutline'
            onClick={() => {
              sendEvent('login_telegram')
              loginTelegram(onSuccess)
            }}
            isLoading={loadingTelegram}
            size='lg'
          >
            <div className='flex items-center justify-center gap-2 text-text'>
              <FaTelegramPlane className={cx('text-xl text-text-muted')} />
              Connect via Telegram
            </div>
          </Button>
          <Button
            variant='primaryOutline'
            onClick={() => {
              sendEvent('login_neynar')
              loginNeynar(onSuccess)
            }}
            isLoading={loadingNeynar}
            size='lg'
          >
            <div className='flex items-center justify-center gap-2 text-text'>
              <FarcasterIcon className={cx('text-xl text-text-muted')} />
              Connect via Farcaster
            </div>
          </Button>
          <GoogleButton />
          <XLoginButton />
        </div>
      </div>
    </div>
  )
}

type LoginModalContents = {
  [key in LoginModalStep]: (props: LoginModalContentProps) => JSX.Element
}
export const loginModalContents: LoginModalContents = {
  login: LoginContent,
  'scan-qr': ScanQrContent,
  'enter-secret-key': LoginWithGrillKeyContent,
  'account-created': AccountCreatedContent,
  'evm-address-link': EvmLoginStep,
  'evm-linking-error': (props) => <EvmLoginStep isErrorStep {...props} />,
}

export function EvmLoginStep({
  setCurrentState,
  isErrorStep,
  closeModal,
}: LoginModalContentProps & { isErrorStep?: boolean }) {
  const { mutate, isLoading } = useLoginBeforeSignEvm()
  const { mutate: setReferrerId } = useSetReferrerId()
  const [refInUrl] = useState(() => getReferralIdInUrl())
  const sendEvent = useSendEvent()

  return (
    <CommonEVMLoginContent
      mutationType='link-identity'
      buttonLabel={isErrorStep ? 'Try again' : undefined}
      isLoading={isLoading}
      beforeSignEvmAddress={() => mutate()}
      onError={() => {
        setCurrentState('evm-linking-error')
      }}
      onSuccess={async (linkedIdentity) => {
        useMyAccount.getState().finalizeTemporaryAccount()
        setReferrerId({ refId: refInUrl })

        const address = useMyAccount.getState().address
        sendEventWithRef(address ?? '', (refId) => {
          sendEvent('account_created', { loginBy: 'evm' }, { ref: refId })
        })

        const profile = await getProfileQuery.fetchQuery(
          null,
          linkedIdentity.mainAddress
        )
        if (!profile) {
          useLoginModal.getState().openNextStepModal({ step: 'create-profile' })
        }
        closeModal()
      }}
    />
  )
}
function useLoginBeforeSignEvm() {
  const [isCreatingAcc, setIsCreatingAcc] = useState(false)
  const loginAsTemporaryAccount = useMyAccount(
    (state) => state.loginAsTemporaryAccount
  )
  const myAddress = useMyMainAddress()

  return {
    mutate: async () => {
      if (myAddress) return

      setIsCreatingAcc(true)
      try {
        const address = await loginAsTemporaryAccount()
        if (!address) throw new Error('Login failed')
      } finally {
        setIsCreatingAcc(false)
      }
    },
    isLoading: isCreatingAcc,
  }
}
