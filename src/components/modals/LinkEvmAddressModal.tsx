import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import {
  useAddExternalProviderToIdentity,
  useUpdateExternalProvider,
} from '@/services/datahub/identity/mutation'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { getAddress, isAddress } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import Button from '../Button'
import Input from '../inputs/Input'
import Modal, { ModalFunctionalityProps, ModalProps } from './Modal'

export default function LinkEvmAddressModal(
  props: ModalFunctionalityProps & Pick<ModalProps, 'title' | 'description'>
) {
  const [evmAddress, setEvmAddress] = useState('')
  const [evmAddressError, setEvmAddressError] = useState('')

  const isAfterSubmit = useRef(false)
  const {
    mutate: addExternalProvider,
    isLoading: loadingAdding,
    isSuccess: successAdding,
    reset: resetAdding,
  } = useAddExternalProviderToIdentity({
    onSuccess: () => {
      isAfterSubmit.current = true
    },
  })
  const {
    mutate: updateExternalProvider,
    isLoading: loadingUpdating,
    isSuccess: successUpdating,
    reset: resetUpdating,
  } = useUpdateExternalProvider({
    onSuccess: () => {
      isAfterSubmit.current = true
    },
  })

  const isLoading = loadingAdding || loadingUpdating
  const isSuccess = successAdding || successUpdating

  const { evmAddress: myEvmAddress, evmAddressProviderId } =
    useLinkedEvmAddress()
  useEffect(() => {
    if (props.isOpen && myEvmAddress) {
      if (!isAfterSubmit.current) {
        setEvmAddress(myEvmAddress)
        resetAdding()
        resetUpdating()
        isAfterSubmit.current = false
      } else {
        props.closeModal()
        isAfterSubmit.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        },
      })
    } else {
      addExternalProvider({
        externalProvider: {
          id: checksumAddress,
          provider: IdentityProvider.EVM,
        },
      })
    }
  }

  const defaultTitle = myEvmAddress
    ? 'Edit your Ethereum address for rewards'
    : 'Your Ethereum address for rewards'

  return (
    <Modal
      {...props}
      title={props.title || defaultTitle}
      description={
        props.description ??
        'We will send your token rewards to this address if you win a contest or event.'
      }
      withCloseButton
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
          isLoading={isLoading || isSuccess}
          disabled={!!evmAddressError || !evmAddress}
          size='lg'
          type='submit'
        >
          Save
        </Button>
      </form>
    </Modal>
  )
}
