import Tabs from '@/components/Tabs'
import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import { cx } from '@/utils/class-names'
import LeaderboardByPoints from './LeaderboardByPoints'
import LeaderboardByReferrals from './LeaderboardByReferrals'

export default function LeaderboardsPage() {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <div className='flex flex-col gap-6 px-4 pt-4'>
        <div className='flex flex-col gap-4'>
          <BackButton title='Leaderboards' backPath='/tg/menu' />
        </div>
        <LeaderboardsPageContent />
      </div>
    </LayoutWithBottomNavigation>
  )
}

const LeaderboardsPageContent = () => {
  const tabs = [
    {
      id: 'ongoing',
      text: '🔥 Ongoing',
      content: () => <OngoungLeaderboards />,
    },
    {
      id: 'history',
      text: '🏁 History',
      content: () => <HistoryLeaderboards />,
    },
  ]

  return (
    <div className='flex h-full w-full flex-col gap-4'>
      <Tabs
        className='rounded-full bg-slate-900 p-[2px]'
        panelClassName='mt-0 w-full h-full max-w-full px-0 z-0'
        containerClassName='h-full'
        tabClassName={(selected) =>
          cx(
            {
              ['bg-background-primary/50 rounded-full [&>span]:!text-text']:
                selected,
            },
            '[&>span]:text-slate-300 leading-6 font-medium p-[6px] [&>span]:text-sm border-none'
          )
        }
        asContainer
        tabStyle='buttons'
        defaultTab={0}
        tabs={tabs}
      />
    </div>
  )
}

const OngoungLeaderboards = () => {
  return (
    <div className='mt-4 flex flex-col gap-4'>
      <LeaderboardByPoints />
    </div>
  )
}

const HistoryLeaderboards = () => {
  return (
    <div className='mt-4 flex flex-col gap-4'>
      <LeaderboardByReferrals />
    </div>
  )
}
