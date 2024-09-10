import BlueGradient from '@/assets/graphics/blue-gradient.png'
import { Skeleton } from '@/components/SkeletonFallback'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import HomePageModals from '@/components/modals/HomePageModals'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import { getPostQuery } from '@/services/api/query'
import { getContentContainersQuery } from '@/services/datahub/content-containers/query'
import { ContentContainerType } from '@/services/datahub/generated-query'
import { useGetTopMemes } from '@/services/datahub/posts/query'
import { useIsAnyQueriesLoading } from '@/subsocial-query'
import { cx } from '@/utils/class-names'
import Image from 'next/image'
import {
  MemesPreviewItem,
  MemesPreviewSkeleton,
} from '../../HomePage/MemesPreview'
import ContainerSkeleton, { ChannelPreview } from '../ContainerPreview'

export default function ChannelsPage() {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <HomePageModals />
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Image
        src={BlueGradient}
        alt=''
        className='absolute left-0 top-0 w-full'
      />
      <div className='relative flex h-full flex-col gap-4 pt-4'>
        <TopMemesToday />
        <ChannelsList />
      </div>
    </LayoutWithBottomNavigation>
  )
}

function ChannelsList() {
  const { data, isLoading } = getContentContainersQuery.useQuery({
    filter: {
      hidden: false,
      containerType: [
        ContentContainerType.PublicChannel,
        ContentContainerType.CommunityChannel,
      ],
    },
  })

  const sorted = data?.data.sort((a, b) =>
    b.containerType === ContentContainerType.PublicChannel ? 1 : -1
  )

  return (
    <div className='flex flex-col gap-2 px-4'>
      {isLoading && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <ContainerSkeleton key={i} />
          ))}
        </>
      )}
      {(sorted ?? []).map((channel) => (
        <ChannelPreview key={channel.id} channel={channel} />
      ))}
    </div>
  )
}

function TopMemesToday() {
  const { data: topMemesIds, isLoading } = useGetTopMemes()

  const renderedMessageQueries = getPostQuery.useQueries(topMemesIds)
  const isMessageLoading = useIsAnyQueriesLoading(renderedMessageQueries)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-0.5 px-4'>
        <h1 className='text-lg font-bold'>Top memes today</h1>
        <span className='text-sm font-medium text-text-muted'>
          Authors of the best memes earn 💎 20,000 points
        </span>
      </div>
      <div className='no-scroll flex items-center gap-3 overflow-auto px-4'>
        {isLoading || isMessageLoading ? (
          <MemesPreviewSkeleton />
        ) : (
          renderedMessageQueries
            .slice(0, 5)
            .map(({ data: message, isLoading }, index) => {
              if (!message) return null

              return isLoading ? (
                <Skeleton
                  key={index}
                  className={cx('!my-0 h-5 w-5 rounded-xl')}
                />
              ) : (
                <MemesPreviewItem
                  key={index}
                  message={message}
                  href={`/tg/channels/${message.struct.rootPostId}`}
                  address={message.struct.createdByAccount}
                />
              )
            })
        )}
      </div>
    </div>
  )
}
