import useLinkedAddress from '@/hooks/useLinkedEvmAddress'
import useToastError from '@/hooks/useToastError'
import {
  useAddExternalProviderToIdentity,
  useUpdateExternalProvider,
} from '@/services/datahub/identity/mutation'
import { useMyMainAddress } from '@/stores/my-account'
import { PublicKey } from '@solana/web3.js'
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

function validateSolAddress(address: string) {
  try {
    let pubkey = new PublicKey(address)
    let isSolana = PublicKey.isOnCurve(pubkey.toBuffer())
    return isSolana
  } catch (error) {
    return false
  }
}

const validateFnByProvider: Record<
  string,
  {
    validate: (address: string) => boolean
    getAddress: (address: string) => string
  }
> = {
  [IdentityProvider.EVM]: { validate: isAddress, getAddress },
  [IdentityProvider.SOLANA]: {
    validate: validateSolAddress,
    getAddress: (address) => {
      if (validateSolAddress(address)) {
        return address
      } else {
        throw new Error('Invalid Solana Address')
      }
    },
  },
}

type LinkAddressModalProps = ModalFunctionalityProps &
  Pick<ModalProps, 'title' | 'description'> & {
    identityProvider?: IdentityProvider
  }

export default function LinkAddressModal({
  identityProvider = IdentityProvider.EVM,
  ...props
}: LinkAddressModalProps) {
  const [linkedAddress, setLinkedAddress] = useState('')
  const [linkedAddressError, setLinkedAddressError] = useState('')
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

  useEffect(() => {
    if (props.isOpen) {
      setLinkedAddress('')
      setLinkedAddressError('')
    }
  }, [props.isOpen])

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
  const myAddress = useMyMainAddress()

  const isLoading = loadingAdding || loadingUpdating

  const { identityAddress, identityAddressProviderId } = useLinkedAddress(
    myAddress || '',
    { enabled: true },
    identityProvider
  )
  useEffect(() => {
    if (props.isOpen && identityAddress) {
      setLinkedAddress(identityAddress)
      resetAdding()
      resetUpdating()
    }
  }, [props.isOpen, identityAddress, resetAdding, resetUpdating])

  const onSubmit = (e: any) => {
    e.preventDefault()
    const { validate, getAddress } = validateFnByProvider[identityProvider]

    if (!linkedAddress || !validate(linkedAddress)) return
    const checksumAddress = getAddress(linkedAddress)

    if (identityAddress) {
      updateExternalProvider({
        entityId: identityAddressProviderId,
        externalProvider: {
          id: checksumAddress,
          provider: identityProvider,
        },
      })
    } else {
      addExternalProvider({
        externalProvider: {
          id: checksumAddress,
          provider: identityProvider,
        },
      })
    }
  }

  const networkName =
    identityProvider === IdentityProvider.EVM ? 'Ethereum' : 'Solana'

  const defaultTitle = identityAddress
    ? `Edit your ${networkName} address for rewards`
    : `Your ${networkName} address for rewards`

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
          error={linkedAddressError}
          value={linkedAddress}
          placeholder={`Your ${networkName} address`}
          onChange={(e) => {
            const address = e.target.value
            setLinkedAddress(address)
            const { validate } = validateFnByProvider[identityProvider]

            if (!validate(address)) {
              setLinkedAddressError(`Invalid ${networkName} Address`)
            } else {
              setLinkedAddressError('')
            }
          }}
        />
        <Button
          isLoading={isLoading || isWaitingEvent}
          disabled={!!linkedAddressError || !linkedAddress}
          size='lg'
          type='submit'
        >
          Save
        </Button>
      </form>
    </BottomDrawer>
  )
}
