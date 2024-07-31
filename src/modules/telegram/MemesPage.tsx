import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import HomePageModals from '@/components/modals/HomePageModals'
import LikeIntroModal from '@/components/modals/LikeIntroModal'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import ChatContent from '../chat/HomePage/ChatContent'
import ContestEvmModal from './ContestEvmModal'

const MemesPage = () => {
  useTgNoScroll()
  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <LikeIntroModal />
      <ChatContent />
      <HomePageModals />
      <ContestEvmModal />
    </LayoutWithBottomNavigation>
  )
}

export default MemesPage
