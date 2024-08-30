import BottomDrawer from '@/components/BottomDrawer'
import Button from '@/components/Button'
import LinkText from '@/components/LinkText'
import Input from '@/components/inputs/Input'
import useIsMounted from '@/hooks/useIsMounted'
import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import { useAddExternalProviderToIdentity } from '@/services/datahub/identity/mutation'
import { useSendEvent } from '@/stores/analytics'
import { useMyMainAddress } from '@/stores/my-account'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import { getAddress, isAddress } from 'ethers'
import { useEffect, useRef, useState } from 'react'

const allowedAccountsList = [
  '0x2cEbeaF60Ec2A73Ac940f4F0324942AAF558AE5a',
  '0x8D8d8b15dd734eE24c1Fbdca01e493be0265DF25',
  '0x85a5B11Bf89A7D7AdDb4FF952a17A93a2b9Fc494',
  '0x52A73ECa2fB7d0b6453ae0CfbcE98092269599c6',
  '0x648C80F202A274f9202df79eBC67508796CcfE35',
  '0xc27871C7aaEE653097fE57a3ce5FFb53F8a1674c',
  '0x9208a29140A711F282bb62b35CB07e9060DdA9FE',
  '0x80fB1BAAE13bFeB6F7CDbd160D6C6DB7b3535Ca1',
]

const ContestEvmModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [evmAddress, setEvmAddress] = useState('')
  const [evmAddressError, setEvmAddressError] = useState('')
  const isMounted = useIsMounted()
  const sendEvent = useSendEvent()

  const myAddress = useMyMainAddress()

  const isAfterSubmit = useRef(false)
  const { mutate, isLoading, isSuccess, reset } =
    useAddExternalProviderToIdentity({
      onSuccess: () => {
        isAfterSubmit.current = true
      },
    })

  const { evmAddress: myEvmAddress, isLoading: isEvmAccountLoading } =
    useLinkedEvmAddress()
  useEffect(() => {
    if (isOpen && myEvmAddress) {
      if (!isAfterSubmit.current) {
        setEvmAddress(myEvmAddress)
        reset()
        isAfterSubmit.current = false
      } else {
        setIsOpen(false)
        isAfterSubmit.current = false

        sendEvent('contest_evm_address_added', { value: myEvmAddress })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, myEvmAddress, reset])

  useEffect(() => {
    if (!isMounted || !myAddress) return

    if (
      allowedAccountsList.includes(myAddress) &&
      isEvmAccountLoading !== undefined &&
      isEvmAccountLoading === false &&
      !myEvmAddress
    ) {
      setTimeout(() => {
        setIsOpen(true)
      })
    } else {
      setIsOpen(false)
    }
  }, [myAddress, myEvmAddress, isMounted, isEvmAccountLoading])

  const onSubmit = (e: any) => {
    e.preventDefault()
    if (!evmAddress || !isAddress(evmAddress)) return
    const checksumAddress = getAddress(evmAddress)
    mutate({
      externalProvider: {
        id: checksumAddress,
        provider: IdentityProvider.EVM,
      },
    })
  }

  return (
    <BottomDrawer
      isOpen={isOpen}
      closeModal={() => {}}
      title={'Your Ethereum address for rewards'}
      description={
        <>
          We will send your rewards to this address to receive your contest
          rewards.{' '}
          <LinkText
            variant='primary'
            className='hover:no-underline'
            href={'https://metamask.io/'}
          >
            What is this?
          </LinkText>
        </>
      }
      withCloseButton={false}
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
    </BottomDrawer>
  )
}

export default ContestEvmModal
