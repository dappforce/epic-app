import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import LeaderboardByPoints from './LeaderboardByPoints'
import LeaderboardByReferrals from './LeaderboardByReferrals'

export default function LeaderboardsPage() {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <div className='flex flex-col gap-6 overflow-auto px-4 pt-4'>
        <div className='flex flex-col gap-4'>
          <BackButton title='Leaderboards' backPath='/tg/menu' />
        </div>
        <LeaderboardsPageContent />
      </div>
    </LayoutWithBottomNavigation>
  )
}

const LeaderboardsPageContent = () => {
  return (
    <div className='flex flex-col gap-4'>
      <LeaderboardByPoints />
      <LeaderboardByReferrals />
    </div>
  )
}
