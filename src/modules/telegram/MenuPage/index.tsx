import BlueGradient from '@/assets/graphics/blue-gradient.png'
import AddressAvatar from '@/components/AddressAvatar'
import Name from '@/components/Name'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import { useMyMainAddress } from '@/stores/my-account'
import Image from 'next/image'
import Menu from './Menu'

const menuItems = [
  [
    { title: 'My Account', icon: '👤', href: '' },
    { title: 'My Memes', icon: '😂', href: '' },
    { title: 'My Crypto Addresses', icon: '🔐', href: '' },
  ],
  [
    { title: 'Leaderboards', icon: '🏆', href: '' },
    { title: 'Airdrop', icon: '💰', href: '/tg/airdrop' },
    { title: 'Premium Features', icon: '🎩', href: '' },
    { title: 'Tap The Cat', icon: '🐈', href: '/tg/tap' },
    { title: 'Moderation Tools', icon: '👮‍♂️', href: '' },
  ],
]

const MenuPage = () => {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Image
        src={BlueGradient}
        priority
        alt=''
        className='absolute left-1/2 z-0 w-full -translate-x-1/2'
      />
      <MenuPageContent />
    </LayoutWithBottomNavigation>
  )
}

const MenuPageContent = () => {
  const myAddress = useMyMainAddress()

  return (
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
  )
}

export default MenuPage
