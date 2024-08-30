import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import useToastError from '@/hooks/useToastError'
import {
  useAddExternalProviderToIdentity,
  useUpdateExternalProvider,
} from '@/services/datahub/identity/mutation'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { getAddress, isAddress } from 'ethers'
import { useEffect, useState } from 'react'
import BottomDrawer from '../BottomDrawer'
import Button from '../Button'
import Input from '../inputs/Input'
import { ModalFunctionalityProps, ModalProps } from './Modal'

export const linkEvmAddressCallbacks: {
  onSuccessCallbacks: (() => void)[]
  onErrorCallbacks: (() => void)[]
} = {
  onSuccessCallbacks: [],
  onErrorCallbacks: [],
}

export default function LinkEvmAddressModal(
  props: ModalFunctionalityProps & Pick<ModalProps, 'title' | 'description'>
) {
  const [evmAddress, setEvmAddress] = useState('')
  const [evmAddressError, setEvmAddressError] = useState('')
  const [isWaitingEvent, setIsWaitingEvent] = useState(false)

  const mutationConfigs = {
    onMutate: () => {
      setIsWaitingEvent(true)
    },
    onError: () => {
      setIsWaitingEvent(false)
    },
    onSuccess: () => {
      linkEvmAddressCallbacks.onSuccessCallbacks.push(() => {
        setIsWaitingEvent(false)
        props.closeModal()
        resetAdding()
        resetUpdating()
      })
      linkEvmAddressCallbacks.onErrorCallbacks.push(() => {
        setIsWaitingEvent(false)
        resetAdding()
        resetUpdating()
      })
    },
  }
  const {
    mutate: addExternalProvider,
    isLoading: loadingAdding,
    reset: resetAdding,
    error: errorAdding,
  } = useAddExternalProviderToIdentity(mutationConfigs)
  const {
    mutate: updateExternalProvider,
    isLoading: loadingUpdating,
    reset: resetUpdating,
    error: errorUpdating,
  } = useUpdateExternalProvider(mutationConfigs)
  useToastError(errorAdding || errorUpdating, 'Failed to link Ethereum address')

  const isLoading = loadingAdding || loadingUpdating

  const { evmAddress: myEvmAddress, evmAddressProviderId } =
    useLinkedEvmAddress()
  useEffect(() => {
    if (props.isOpen && myEvmAddress) {
      setEvmAddress(myEvmAddress)
      resetAdding()
      resetUpdating()
    }
  }, [props.isOpen, myEvmAddress, resetAdding, resetUpdating])

  const onSubmit = (e: any) => {
    e.preventDefault()
    if (!evmAddress || !isAddress(evmAddress)) return
    const checksumAddress = getAddress(evmAddress)
    if (myEvmAddress) {
      updateExternalProvider({
        entityId: evmAddressProviderId,
        externalProvider: {
          id: checksumAddress,
          provider: IdentityProvider.EVM,
          enabled: true,
        },
      })
    } else {
      addExternalProvider({
        externalProvider: {
          id: checksumAddress,
          provider: IdentityProvider.EVM,
          enabled: true,
        },
      })
    }
  }

  const defaultTitle = myEvmAddress
    ? 'Edit your Ethereum address for rewards'
    : 'Your Ethereum address for rewards'

  return (
    <BottomDrawer
      {...props}
      title={props.title || defaultTitle}
      description={
        props.description ??
        'We will send your token rewards to this address if you win a contest or event.'
      }
    >
      <form onSubmit={onSubmit} className='mt-2 flex flex-col gap-6 pb-2'>
        <Input
          error={evmAddressError}
          value={evmAddress}
          placeholder='Your Ethereum address'
          onChange={(e) => {
            const address = e.target.value
            setEvmAddress(address)
            if (!isAddress(address)) {
              setEvmAddressError('Invalid Ethereum Address')
            } else {
              setEvmAddressError('')
            }
          }}
        />
        <Button
          isLoading={isLoading || isWaitingEvent}
          disabled={!!evmAddressError || !evmAddress}
          size='lg'
          type='submit'
        >
          Save
        </Button>
      </form>
    </BottomDrawer>
  )
}
