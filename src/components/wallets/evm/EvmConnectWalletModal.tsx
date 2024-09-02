import { CommonEVMLoginContent } from '@/components/auth/common/evm/CommonEvmModalContent'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import { useSendEvent } from '@/stores/analytics'
import { useState } from 'react'

export default function EvmConnectWalletModal(props: ModalFunctionalityProps) {
  const [isError, setIsError] = useState(false)
  const sendEvent = useSendEvent()

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
          props.closeModal()
        }}
      />
    </Modal>
  )
}
