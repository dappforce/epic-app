import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import { useUpdateExternalProvider } from '@/services/datahub/identity/mutation'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import Button from '../Button'
import Modal, { ModalFunctionalityProps } from '../modals/Modal'

type ChainType = 'evm' | 'solana'
const labels: Record<ChainType, string> = {
  evm: 'Ethereum',
  solana: 'Solana',
}

export default function UnlinkWalletModal({
  chain,
  ...props
}: ModalFunctionalityProps & { chain: 'evm' | 'solana' }) {
  const { evmAddress, evmAddressProviderId } = useLinkedEvmAddress()
  const { mutate, isLoading } = useUpdateExternalProvider()

  return (
    <Modal
      {...props}
      title={`🖇️ Unlink your ${labels[chain]} address?`}
      description={`Are you sure you want to unlink your ${labels[chain]} address?`}
    >
      <div className='mt-4 flex flex-col gap-4'>
        <Button size='lg' onClick={() => props.closeModal()}>
          No, keep it linked
        </Button>
        <Button
          size='lg'
          onClick={() => {
            if (!evmAddress) return
            mutate({
              entityId: evmAddressProviderId,
              externalProvider: {
                id: evmAddress,
                provider: IdentityProvider.EVM,
                enabled: false,
              },
            })
          }}
          variant='primaryOutline'
          className='border-red-500'
          isLoading={isLoading}
        >
          Yes, unlink
        </Button>
      </div>
    </Modal>
  )
}
