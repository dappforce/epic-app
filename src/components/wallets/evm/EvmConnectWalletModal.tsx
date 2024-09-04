import { CommonEVMLoginContent } from '@/components/auth/common/evm/CommonEvmModalContent'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import useLinkedAddress from '@/hooks/useLinkedEvmAddress'
import { useSendEvent } from '@/stores/analytics'
import { useMyMainAddress } from '@/stores/my-account'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { useState } from 'react'

export default function EvmConnectWalletModal(props: ModalFunctionalityProps) {
  const [isError, setIsError] = useState(false)
  const sendEvent = useSendEvent()
  const myAddress = useMyMainAddress()
  const { refetch } = useLinkedAddress(
    myAddress || '',
    { enabled: true },
    IdentityProvider.EVM
  )

  return (
    <Modal
      {...props}
      title='🔑 Connect Ethereum address'
      description='Create an on-chain proof to link your Epic account.'
      withCloseButton
    >
      <CommonEVMLoginContent
        mutationType='add-provider'
        buttonLabel={isError ? 'Try again' : undefined}
        onError={() => {
          setIsError(true)
        }}
        onSuccess={() => {
          sendEvent(`finish_add_provider_evm_standalone`)
          refetch()
          props.closeModal()
        }}
      />
    </Modal>
  )
}
