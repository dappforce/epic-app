import BlueGradient from '@/assets/graphics/blue-gradient.png'
import AddressAvatar from '@/components/AddressAvatar'
import Name from '@/components/Name'
import Toast from '@/components/Toast'
import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import LinkEvmAddressModal from '@/components/modals/LinkEvmAddressModal'
import { getReferralLink } from '@/components/referral/utils'
import SubsocialProfileModal from '@/components/subsocial-profile/SubsocialProfileModal'
import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import { useMyMainAddress } from '@/stores/my-account'
import { truncateAddress } from '@/utils/account'
import { copyToClipboard } from '@/utils/strings'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  CrearLocalData,
  DeleteAccountConfirmationModal,
} from './ClearDataModals'
import Menu from './Menu'

type Page = 'menu' | 'my-account' | 'my-crypto-addresses'

type ContentProps = {
  setPage: (page: Page) => void
}

const contentsByPage: {
  [key in Page]: (props: ContentProps) => JSX.Element
} = {
  menu: MenuPageContent,
  'my-account': MyAccountPageContent,
  'my-crypto-addresses': MyCryptoAddressesContent,
}

const MenuPage = () => {
  useTgNoScroll()
  const [page, setPage] = useState<Page>('menu')

  const ContentByPage = contentsByPage[page]

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <ContentByPage setPage={setPage} />
    </LayoutWithBottomNavigation>
  )
}

function MenuPageContent({ setPage }: ContentProps) {
  const myAddress = useMyMainAddress()

  const menuItems = [
    [
      { title: 'My Account', icon: '👤', onClick: () => setPage('my-account') },
      { title: 'My Memes', icon: '😂', href: '/tg/my-memes' },
      {
        title: 'My Crypto Addresses',
        icon: '🔐',
        onClick: () => setPage('my-crypto-addresses'),
      },
    ],
    [
      { title: 'Leaderboards', icon: '🏆', href: '' },
      { title: 'Airdrop', icon: '💰', href: '/tg/airdrop' },
      { title: 'Premium Features', icon: '🎩', href: '/tg/premium' },
      { title: 'Tap The Cat', icon: '🐈', href: '/tg/tap' },
      { title: 'Moderation Tools', icon: '👮‍♂️', href: '' },
    ],
  ]

  return (
    <>
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Image
        src={BlueGradient}
        priority
        alt=''
        className='absolute left-1/2 z-0 w-full -translate-x-1/2'
      />
      <div className='z-10 flex flex-col gap-6 overflow-auto px-4 py-4'>
        <div className='flex w-full flex-col items-center gap-4'>
          <AddressAvatar
            address={myAddress || ''}
            className='h-[80px] w-[80px]'
          />
          <Name address={myAddress || ''} />
        </div>
        <Menu menuItems={menuItems} />
      </div>
    </>
  )
}

type ModalKind =
  | 'edit-profile'
  | 'delete-account'
  | 'clear-local-data'
  | undefined

function MyAccountPageContent({ setPage }: ContentProps) {
  const [modalKind, setModalKind] = useState<ModalKind>()
  const myAddress = useMyMainAddress()
  const referralLink = getReferralLink(myAddress)

  const myAccountItems = [
    [
      {
        title: 'Change Name & Avatar',
        icon: '✏️',
        onClick: () => setModalKind('edit-profile'),
      },
    ],
    [
      {
        title: 'Copy My Profile Link',
        icon: '🔗',
        onClick: () => {
          copyToClipboard(referralLink)
          toast.custom((t) => <Toast t={t} title='Copied to clipboard!' />)
        },
      },
    ],
    [
      {
        title: 'Clear Local Data',
        icon: '🗑️',
        onClick: () => setModalKind('clear-local-data'),
        textClassName: 'text-red-400',
      },
      {
        title: 'Delete Account',
        icon: '🧹',
        onClick: () => setModalKind('delete-account'),
        textClassName: 'text-red-400',
      },
    ],
  ]

  return (
    <>
      <div className='flex flex-col gap-6 px-4 pt-4'>
        <div className='flex flex-col gap-4'>
          <BackButton title='My Account' backClick={() => setPage('menu')} />
          <span className='text-slate-400'>
            Manage your personal information and preferences.
          </span>
        </div>
        <Menu menuItems={myAccountItems} />
      </div>
      <SubsocialProfileModal
        title='✏️ Edit Profile'
        closeModal={() => setModalKind(undefined)}
        isOpen={modalKind === 'edit-profile'}
      />
      <DeleteAccountConfirmationModal
        isOpen={modalKind === 'delete-account'}
        onClose={() => setModalKind(undefined)}
      />
      <CrearLocalData
        isOpen={modalKind === 'clear-local-data'}
        onClose={() => setModalKind(undefined)}
      />
    </>
  )
}

type AddressesModalKind = 'evm' | 'solana' | undefined

function MyCryptoAddressesContent({ setPage }: ContentProps) {
  const [modaKind, setModalKind] = useState<AddressesModalKind>(undefined)
  const { evmAddress: myEvmAddress } = useLinkedEvmAddress()

  const cryptoAddressesItems = [
    [
      {
        title: `${myEvmAddress ? 'Edit' : 'Add'} Ethereum Address`,
        desc: myEvmAddress ? (
          <span className='font-medium leading-none text-slate-400'>
            {truncateAddress(myEvmAddress)}
          </span>
        ) : undefined,
        icon: myEvmAddress ? '✏️' : '🛠️',
        onClick: () => setModalKind('evm'),
      },
      { title: 'Add Solana Address', icon: '🛠️', disabled: true },
    ],
  ]

  return (
    <>
      <div className='flex flex-col gap-6 px-4 pt-4'>
        <div className='flex flex-col gap-4'>
          <BackButton
            title='My Crypto Addresses'
            backClick={() => setPage('menu')}
          />
          <span className='text-slate-400'>
            Add your wallet addresses to receive rewards if you win contests.
          </span>
        </div>
        <Menu menuItems={cryptoAddressesItems} />
      </div>
      <LinkEvmAddressModal
        isOpen={modaKind === 'evm'}
        closeModal={() => setModalKind(undefined)}
      />
    </>
  )
}

export default MenuPage
