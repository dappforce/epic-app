import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import HomePageModals from '@/components/modals/HomePageModals'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import ContestEvmModal from '../ContestEvmModal'
import MemePageChatContent from './ChatContent'
import HowToEarnMessage from './HowToEarnMessage'

const MemesPage = () => {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <MemePageChatContent />
      <HomePageModals />
      <ContestEvmModal />
      <HowToEarnMessage />
    </LayoutWithBottomNavigation>
  )
}

export default MemesPage
