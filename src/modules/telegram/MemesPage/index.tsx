import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import HomePageModals from '@/components/modals/HomePageModals'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import ChatContent from '../../chat/HomePage/ChatContent'
import ContestEvmModal from '../ContestEvmModal'
import HowToEarnMessage from './HowToEarnMessage'

const MemesPage = () => {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <ChatContent />
      <HomePageModals />
      <ContestEvmModal />
      <HowToEarnMessage />
    </LayoutWithBottomNavigation>
  )
}

export default MemesPage
