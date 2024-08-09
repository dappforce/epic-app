import BlueGradient from '@/assets/graphics/blue-gradient.png'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import { env } from '@/env.mjs'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import Image from 'next/image'
import ContestPreview from './ContestPreview'
import MemesPreview from './MemesPreview'
import TasksPreview from './TasksPreview'

const HomePage = () => {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Image
        src={BlueGradient}
        priority
        alt=''
        className='absolute -top-[180px] left-1/2 z-0 w-full -translate-x-1/2'
      />
      <HomePageContent />
    </LayoutWithBottomNavigation>
  )
}

const HomePageContent = () => {
  return (
    <div className='flex flex-col gap-10 overflow-y-auto px-4 py-6'>
      <MemesPreview
        chatId={env.NEXT_PUBLIC_MAIN_CHAT_ID}
        hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
      />
      <ContestPreview />
      <TasksPreview />
    </div>
  )
}

export default HomePage
