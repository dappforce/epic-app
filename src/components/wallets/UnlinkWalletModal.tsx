import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import {
  reloadEveryIntervalUntilLinkedIdentityFound,
  useUpdateExternalProvider,
} from '@/services/datahub/identity/mutation'
import { useMyMainAddress } from '@/stores/my-account'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { useEffect } from 'react'
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
  const myAddress = useMyMainAddress()

  const identityProvider =
    chain === 'evm' ? IdentityProvider.EVM : IdentityProvider.SOLANA

  const { identityAddress, identityAddressProviderId, refetch } =
    useLinkedEvmAddress(myAddress || '', { enabled: true }, identityProvider)
  const { mutate, isLoading, isSuccess, reset } = useUpdateExternalProvider({
    onSuccess: (_, { externalProvider }) => {
      refetch()
      reloadEveryIntervalUntilLinkedIdentityFound((identity) => {
        const found = identity?.externalProviders.find(
          (p) =>
            // @ts-expect-error different provider for IdentityProvider, one from generated type, one from sdk
            p.provider === externalProvider.provider &&
            p.externalId === externalProvider.id
        )
        if (!found) {
          props.closeModal()
        }
        return !found
      })
    },
  })

  useEffect(() => {
    reset()
  }, [props.isOpen, reset])

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
            if (!identityAddress) return
            mutate({
              entityId: identityAddressProviderId,
              externalProvider: {
                id: identityAddress,
                provider: identityProvider,
                enabled: false,
              },
            })
          }}
          variant='primaryOutline'
          className='border-red-500'
          isLoading={isLoading || isSuccess}
        >
          Yes, unlink
        </Button>
      </div>
    </Modal>
  )
}
