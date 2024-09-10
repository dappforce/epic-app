import BlueGradient from '@/assets/graphics/blue-gradient.png'
import TabButtons from '@/components/TabButtons'
import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
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
      <Image
        src={BlueGradient}
        alt=''
        className='absolute left-0 top-0 w-full'
      />
      <div className='flex flex-col overflow-auto px-4 pt-4'>
        <div className='flex flex-col gap-4'>
          <BackButton title='Meme Contests' backPath='/tg/menu' />
        </div>
        <p className='mt-2 text-text-muted'>
          Compete with others by submitting the best memes to earn rewards.
        </p>
        <div className='relative mt-4 flex h-full flex-col gap-4'>
          <TabButtons
            className='mt-2'
            tabs={['History', 'Ongoing', 'Upcoming']}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <ContestsList selectedTab={selectedTab} />
        </div>
      </div>
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
          There are no {selectedTab.toLowerCase()} contests right now. Please
          check back later.
        </div>
      )}
      {data?.data?.map((contest) => (
        <ContestPreview key={contest.id} contest={contest} />
      ))}
    </div>
  )
}
