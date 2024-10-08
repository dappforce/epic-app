import useLinkedAddress from '@/hooks/useLinkedProviders'
import {
  reloadEveryIntervalUntilLinkedIdentityFound,
  useUpdateExternalProvider,
} from '@/services/datahub/identity/mutation'
import { useMyMainAddress } from '@/stores/my-account'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { useEffect } from 'react'
import BottomDrawer from '../BottomDrawer'
import Button from '../Button'
import { ModalFunctionalityProps } from '../modals/Modal'

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
    useLinkedAddress(myAddress || '', { enabled: true }, identityProvider)

  const { mutate, isLoading, isSuccess, reset } = useUpdateExternalProvider({
    onSuccess: (_, { externalProvider }) => {
      reloadEveryIntervalUntilLinkedIdentityFound((identity) => {
        const isStillEnabled = identity?.externalProviders.find(
          (p) =>
            // @ts-expect-error different provider for IdentityProvider, one from generated type, one from sdk
            p.provider === externalProvider.provider &&
            p.externalId === externalProvider.id &&
            p.enabled
        )
        if (!isStillEnabled) {
          props.closeModal()
          return true
        }
        return false
      })
    },
  })

  useEffect(() => {
    reset()
  }, [props.isOpen, reset])

  return (
    <BottomDrawer
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
    </BottomDrawer>
  )
}
