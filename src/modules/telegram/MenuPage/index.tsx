import BlueGradient from '@/assets/graphics/blue-gradient.png'
import AddressAvatar from '@/components/AddressAvatar'
import Name from '@/components/Name'
import Toast from '@/components/Toast'
import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import { getReferralLink } from '@/components/referral/utils'
import SubsocialProfileModal from '@/components/subsocial-profile/SubsocialProfileModal'
import UnlinkWalletModal from '@/components/wallets/UnlinkWalletModal'
import UseMobileModal from '@/components/wallets/UseMobileModal'
import EvmConnectWalletModal from '@/components/wallets/evm/EvmConnectWalletModal'
import useIsModerationAdmin from '@/hooks/useIsModerationAdmin'
import { useLinkedProviders } from '@/hooks/useLinkedEvmAddress'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import { useMyMainAddress } from '@/stores/my-account'
import { useSubscriptionState } from '@/stores/subscription'
import { truncateAddress } from '@/utils/account'
import { isTouchDevice } from '@/utils/device'
import { copyToClipboard } from '@/utils/strings'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useGetSolanaWalletUrl } from '../AirdropPage/solana'
import {
  CrearLocalData,
  DeleteAccountConfirmationModal,
} from './ClearDataModals'
import LoginAsUser from './LoginAsUser'
import Menu from './Menu'
import SearchUser from './SearchUser'

type Page = 'menu' | 'my-account' | 'my-crypto-addresses' | 'moderation-tools'

type ContentProps = {
  setPage: (page: Page) => void
}

const contentsByPage: {
  [key in Page]: (props: ContentProps) => JSX.Element
} = {
  menu: MenuPageContent,
  'my-account': MyAccountPageContent,
  'my-crypto-addresses': MyCryptoAddressesContent,
  'moderation-tools': ModerationToolsContent,
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
  const isAdmin = useIsModerationAdmin()

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
      { title: 'Leaderboards', icon: '🏆', href: '/tg/leaderboards' },
      { title: 'Airdrop', icon: '💰', href: '/tg/airdrop' },
      { title: 'Premium Features', icon: '🎩', href: '/tg/premium' },
      { title: 'Tap The Cat', icon: '🐈', href: '/tg/tap' },
      {
        title: 'Moderation Tools',
        icon: '👮‍♂️',
        onClick: () => setPage('moderation-tools'),
        hidden: !isAdmin,
      },
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
      <div className='z-10 flex flex-col gap-6 overflow-auto px-4 py-6'>
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

type ModalChain = 'evm' | 'solana'

function MyCryptoAddressesContent({ setPage }: ContentProps) {
  const myAddress = useMyMainAddress()
  const [modalKind, setModalKind] = useState<ModalChain>()
  const solanaWalletUrl = useGetSolanaWalletUrl()
  const router = useRouter()
  const [isOpenUseMobileModal, setIsOpenUseMobileModal] = useState(false)
  const [openEvmConnectWalletModal, setOpenEvmConnectWalletModal] =
    useState(false)
  const [openUnlinkModal, setOpenUnlinkModal] = useState(false)
  const [connectSolanaClick, setConnectSolanaClick] = useState(false)

  useEffect(() => {
    if (connectSolanaClick) {
      useSubscriptionState
        .getState()
        .setSubscriptionState('identity', 'always-sub')
    }
  }, [])

  const { providers } = useLinkedProviders(myAddress || '')

  const evmProvider = providers?.find(
    (provider) => provider.provider === IdentityProvider.EVM.toString()
  )

  const solanaProvider = providers?.find(
    (provider) => provider.provider === IdentityProvider.SOLANA.toString()
  )

  const cryptoAddressesItems = [
    [
      {
        title: `${evmProvider?.externalId ? 'Unlink' : 'Add'} Ethereum Address`,
        desc: evmProvider?.externalId ? (
          <span className='font-medium leading-none text-slate-400'>
            {truncateAddress(evmProvider?.externalId)}
          </span>
        ) : undefined,
        icon: evmProvider?.externalId ? '🖇️' : '🛠️',
        onClick: () => {
          setModalKind('evm')
          if (evmProvider?.externalId) {
            setOpenUnlinkModal(true)
          } else {
            if (!isTouchDevice()) {
              setIsOpenUseMobileModal(true)
              return
            }

            setOpenEvmConnectWalletModal(true)
          }
        },
      },
      {
        title: `${
          solanaProvider?.externalId ? 'Unlink' : 'Add'
        } Solana Address`,
        icon: solanaProvider?.externalId ? '🖇️' : '🛠️',
        onClick: () => {
          setModalKind('solana')

          if (solanaProvider?.externalId) {
            setOpenUnlinkModal(true)
          } else {
            if (!isTouchDevice()) {
              setIsOpenUseMobileModal(true)
              return
            }

            setConnectSolanaClick(true)
            router.push(solanaWalletUrl)
          }
        },
        desc: solanaProvider?.externalId ? (
          <span className='font-medium leading-none text-slate-400'>
            {truncateAddress(solanaProvider?.externalId)}
          </span>
        ) : undefined,
      },
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
      <EvmConnectWalletModal
        isOpen={openEvmConnectWalletModal}
        closeModal={() => setOpenEvmConnectWalletModal(false)}
      />
      <UnlinkWalletModal
        chain={modalKind || 'evm'}
        isOpen={openUnlinkModal}
        closeModal={() => setOpenUnlinkModal(false)}
      />

      <UseMobileModal
        isOpen={isOpenUseMobileModal}
        closeModal={() => setIsOpenUseMobileModal(false)}
        chain={modalKind as ModalChain}
      />
    </>
  )
}

function ModerationToolsContent({ setPage }: ContentProps) {
  return (
    <>
      <div className='flex flex-col gap-6 px-4 pt-4'>
        <BackButton
          title='Moderation Tools'
          backClick={() => setPage('menu')}
        />
        <SearchUser />
        <LoginAsUser />
      </div>
    </>
  )
}

export default MenuPage
