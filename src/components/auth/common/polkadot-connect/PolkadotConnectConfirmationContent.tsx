import LinkingDark from '@/assets/graphics/linking-dark.svg'
import LinkingLight from '@/assets/graphics/linking-light.svg'
import Button from '@/components/Button'
import { sendEventWithRef } from '@/components/referral/analytics'
import { ESTIMATED_ENERGY_FOR_ONE_TX } from '@/constants/subsocial'
import { useLinkIdentity } from '@/services/datahub/identity/mutation'
import { AddProxyWrapper } from '@/services/subsocial/proxy/mutation'
import { useSendEvent } from '@/stores/analytics'
import { useLoginModal } from '@/stores/login-modal'
import { useMyAccount } from '@/stores/my-account'
import { estimatedWaitTime } from '@/utils/network'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { toSubsocialAddress } from '@subsocial/utils'
import { useState } from 'react'
import { PolkadotConnectContentProps } from './types'

export default function PolkadotConnectConfirmationContent({
  closeModal,
  beforeAddProxy,
  onError,
  onSuccess,
}: PolkadotConnectContentProps & {
  onSuccess?: () => void
  onError?: () => void
  beforeAddProxy?: () => Promise<boolean>
}) {
  const sendEvent = useSendEvent()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const connectedWallet = useMyAccount((state) => state.connectedWallet)
  const isLoadingEnergy = useMyAccount(
    (state) => state.connectedWallet?.energy === undefined
  )
  const hasEnoughEnergy = useMyAccount(
    (state) =>
      (state.connectedWallet?.energy ?? 0) >= ESTIMATED_ENERGY_FOR_ONE_TX
  )
  const saveProxyAddress = useMyAccount((state) => state.saveProxyAddress)
  const { mutateAsync: linkIdentity } = useLinkIdentity()

  return (
    <div className='mt-2 flex flex-col gap-6'>
      <div className='flex w-full flex-col items-center gap-4'>
        <AddProxyWrapper
          loadingUntilTxSuccess
          config={{
            txCallbacks: {
              onSend: () => {
                setIsSent(true)
              },
              onSuccess: async () => {
                saveProxyAddress()
                sendEvent('polkadot_address_linked', undefined, {
                  polkadotLinked: true,
                })

                onSuccess?.()
                closeModal()
              },
              onError,
            },
            onError,
          }}
        >
          {({ isLoading: isAddingProxy, mutateAsync: addProxy }) => {
            let loadingText: string | undefined
            if (isSent) {
              loadingText = `It may take up to ${estimatedWaitTime} seconds`
            } else if (isLoadingEnergy) {
              loadingText = 'Connecting to Subsocial...'
            } else if (!hasEnoughEnergy) {
              loadingText = 'Waiting for energy...'
            } else if (isAddingProxy) {
              loadingText = 'Pending Confirmation...'
            } else if (isProcessing) {
              loadingText = 'Creating your proxy account...'
            } else {
              loadingText = undefined
            }

            return (
              <>
                <div className='mb-2 w-full'>
                  {isAddingProxy || isProcessing ? (
                    <div className='animate-pulse'>
                      <LinkingLight className='block w-full dark:hidden' />
                      <LinkingDark className='hidden w-full dark:block' />
                    </div>
                  ) : (
                    <>
                      <LinkingLight className='block w-full dark:hidden' />
                      <LinkingDark className='hidden w-full dark:block' />
                    </>
                  )}
                </div>

                <Button
                  className='w-full'
                  size='lg'
                  onClick={async () => {
                    const address = toSubsocialAddress(connectedWallet?.address)
                    const signer = connectedWallet?.signer
                    if (address && signer) {
                      setIsProcessing(true)
                      const shouldProceed = beforeAddProxy
                        ? await beforeAddProxy?.()
                        : true
                      setIsProcessing(false)
                      if (!shouldProceed) return
                      await addProxy(null)
                      useLoginModal.getState().openNextStepModal({
                        step: 'save-grill-key',
                        provider: 'polkadot',
                      })

                      linkIdentity({
                        id: connectedWallet?.address ?? '',
                        provider: IdentityProvider.POLKADOT,
                      })
                      sendEventWithRef(
                        connectedWallet?.address ?? '',
                        (refId) => {
                          sendEvent(
                            'login',
                            { loginBy: 'polkadot' },
                            { ref: refId }
                          )
                        }
                      )
                    }
                  }}
                  isLoading={isAddingProxy || isLoadingEnergy || isProcessing}
                  loadingText={loadingText}
                >
                  Confirm
                </Button>
              </>
            )
          }}
        </AddProxyWrapper>
      </div>
    </div>
  )
}
