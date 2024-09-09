import BlueGradient from '@/assets/graphics/blue-gradient.png'
import Container from '@/components/Container'
import TabButtons from '@/components/TabButtons'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import PointsWidget from '@/modules/points/PointsWidget'
import { getContentContainersQuery } from '@/services/datahub/content-containers/query'
import {
  ContentContainerConfigsFilter,
  ContentContainerType,
} from '@/services/datahub/generated-query'
import Image from 'next/image'
import { useState } from 'react'
import ContainerSkeleton, { ContestPreview } from '../ContainerPreview'

export default function ContestsPage({
  defaultSelectedTab,
}: {
  defaultSelectedTab: string
}) {
  const [selectedTab, setSelectedTab] = useState(
    defaultSelectedTab ?? 'Ongoing'
  )

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Image
        src={BlueGradient}
        alt=''
        className='absolute left-0 top-0 w-full'
      />
      <Container className='relative flex h-full flex-col gap-4 pt-6'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <h1 className='text-3xl font-bold'>MEME CONTESTS</h1>
          <p className='text-text-muted'>
            Complete tasks within a limited time to earn rewards.
          </p>
        </div>
        <TabButtons
          className='mt-2'
          tabs={['History', 'Ongoing', 'Upcoming']}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <ContestsList selectedTab={selectedTab} />
      </Container>
    </LayoutWithBottomNavigation>
  )
}

function ContestsList({ selectedTab }: { selectedTab: string }) {
  const filter: ContentContainerConfigsFilter = {
    hidden: false,
    containerType: [ContentContainerType.Contest],
  }
  if (selectedTab === 'Ongoing') {
    filter.isOpen = true
    filter.isClosed = false
  } else if (selectedTab === 'Upcoming') {
    filter.isOpen = false
  } else {
    filter.isClosed = true
  }
  const { data, isLoading } = getContentContainersQuery.useQuery({ filter })

  return (
    <div className='flex flex-col gap-2'>
      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => <ContainerSkeleton key={i} />)}
      {data?.data.length === 0 && (
        <div className='mt-4 text-center text-text-muted'>
          No {selectedTab.toLowerCase()} contests yet.
        </div>
      )}
      {data?.data?.map((contest) => (
        <ContestPreview key={contest.id} contest={contest} />
      ))}
    </div>
  )
}
