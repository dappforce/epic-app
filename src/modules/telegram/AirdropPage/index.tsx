import Tokens from '@/assets/graphics/airdrop/tokens.png'
import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import Card from '@/components/Card'
import LinkText from '@/components/LinkText'
import Name from '@/components/Name'
import Toast from '@/components/Toast'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import SubsocialProfileModal from '@/components/subsocial-profile/SubsocialProfileModal'
import UnlinkWalletModal from '@/components/wallets/UnlinkWalletModal'
import EvmConnectWalletModal from '@/components/wallets/evm/EvmConnectWalletModal'
import useIsModerationAdmin from '@/hooks/useIsModerationAdmin'
import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import { useSendEvent } from '@/stores/analytics'
import { useMyMainAddress } from '@/stores/my-account'
import { truncateAddress } from '@/utils/account'
import { copyToClipboard } from '@/utils/strings'
import Image from 'next/image'
import { useState } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { RiPencilFill } from 'react-icons/ri'
import { toast } from 'sonner'
import RemoveLinkedIdentityModal from './RemoveLinkedIdentityModal'
import SearchUser from './SearchUser'

export default function AirdropPage() {
  useTgNoScroll()

  const [isOpenUnlinkModal, setIsOpenUnlinkModal] = useState(false)
  const isAdmin = useIsModerationAdmin()
  const [isOpenRemoveAccountModal, setIsOpenRemoveAccountModal] =
    useState(false)
  const [openProfileModal, setOpenProfileModal] = useState(false)
  const [openEvmLinkModal, setOpenEvmLinkModal] = useState(false)
  const myAddress = useMyMainAddress()
  const sendEvent = useSendEvent()

  const { evmAddress, isLoading } = useLinkedEvmAddress()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <div className='flex flex-1 flex-col gap-4 overflow-auto'>
        <div className='flex flex-col'>
          <TokenGraphics />
          <div className='-mt-2 flex flex-col gap-2 text-center'>
            <span className='text-lg font-semibold'>Rewards soon</span>
            <span className='px-4 text-text-muted'>
              Points are in-app rewards exchangeable for something really cool
              later
            </span>
          </div>
        </div>
        {isAdmin && <SearchUser />}
        <div className='mb-4 px-4'>
          <Card className='flex flex-col items-center gap-4 bg-background-light'>
            <AddressAvatar address={myAddress ?? ''} className='h-16 w-16' />
            <div className='flex items-center gap-3'>
              <Name address={myAddress ?? ''} className='text-lg font-medium' />
              <Button
                size='circleSm'
                variant='muted'
                className='inline'
                onClick={() => {
                  sendEvent('edit_profile_click')
                  setOpenProfileModal(true)
                }}
              >
                <RiPencilFill />
              </Button>
            </div>
            {(() => {
              if (isLoading) return null
              if (evmAddress) {
                return (
                  <Card className='mb-2 flex w-full items-center justify-between gap-4 p-4 py-3'>
                    <div className='flex flex-col gap-1'>
                      <span className='text-sm font-medium text-text-muted'>
                        My Ethereum Address
                      </span>
                      <div className='flex items-center gap-2.5'>
                        <span className='font-semibold'>
                          {truncateAddress(evmAddress ?? '')}
                        </span>
                        <Button
                          className='flex-shrink-0 text-sm text-text-muted'
                          variant='transparent'
                          size='circleSm'
                          onClick={() => {
                            sendEvent('copy_evm_address_click')
                            copyToClipboard(evmAddress ?? '')
                            toast.custom((t) => (
                              <Toast t={t} title='Copied to clipboard!' />
                            ))
                          }}
                        >
                          <MdContentCopy />
                        </Button>
                      </div>
                    </div>
                    <LinkText
                      className='mr-1 text-text-red'
                      onClick={() => {
                        sendEvent('edit_evm_address_click')
                        setOpenEvmLinkModal(true)
                      }}
                    >
                      Unlink
                    </LinkText>
                  </Card>
                )
              } else {
                return (
                  <div>
                    <Button
                      className='w-full'
                      onClick={() => {
                        sendEvent('connect_evm_address_click')
                        setOpenEvmLinkModal(true)
                      }}
                      variant='primaryOutline'
                    >
                      Connect Ethereum Wallet
                    </Button>
                  </div>
                )
              }
            })()}
            {isAdmin && (
              <div className='flex flex-col gap-2'>
                <Button
                  variant='redOutline'
                  onClick={() => {
                    sendEvent('remove_account_click')
                    setIsOpenRemoveAccountModal(true)
                  }}
                >
                  Remove Account
                </Button>
                <Button
                  variant='transparent'
                  onClick={() => {
                    sendEvent('clear_local_storage_click')
                    if (confirm('Are you sure to remove all local data?')) {
                      localStorage.clear()
                      window.location.reload()
                    }
                  }}
                >
                  Clear Local Data
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      <RemoveLinkedIdentityModal
        isOpen={isOpenRemoveAccountModal}
        closeModal={() => setIsOpenRemoveAccountModal(false)}
      />
      <SubsocialProfileModal
        title='✏️ Edit Profile'
        closeModal={() => setOpenProfileModal(false)}
        isOpen={openProfileModal}
      />
      <EvmConnectWalletModal
        isOpen={openEvmLinkModal}
        closeModal={() => setOpenEvmLinkModal(false)}
      />
      <UnlinkWalletModal
        isOpen={isOpenUnlinkModal}
        closeModal={() => setIsOpenUnlinkModal(false)}
        chain='evm'
      />
    </LayoutWithBottomNavigation>
  )
}

function TokenGraphics() {
  return (
    <div className='relative overflow-clip'>
      <Image src={Tokens} alt='' />
    </div>
  )
}
