import BlueGradient from '@/assets/graphics/blue-gradient.png'
import { Skeleton } from '@/components/SkeletonFallback'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import PointsWidget from '@/modules/points/PointsWidget'
import { getPostQuery } from '@/services/api/query'
import {
  ContentContainer,
  getContentContainersQuery,
} from '@/services/datahub/content-containers/query'
import { useGetTopMemes } from '@/services/datahub/posts/query'
import { cx } from '@/utils/class-names'
import { isEmptyArray } from '@subsocial/utils'
import Image from 'next/image'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa6'
import {
  MemesPreviewItem,
  MemesPreviewSkeleton,
} from '../../HomePage/MemesPreview'

export default function ChannelsPage() {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
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
    filter: { hidden: false },
  })

  return (
    <div className='flex flex-col gap-2 px-4'>
      {isLoading && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-16 w-full rounded-xl' />
          ))}
        </>
      )}
      {data?.data.map((channel) => (
        <Channel key={channel.id} channel={channel} />
      ))}
    </div>
  )
}
function Channel({ channel }: { channel: ContentContainer }) {
  return (
    <Link
      href={`/tg/channels/${channel.rootPost.id}`}
      className='flex items-center gap-2.5 rounded-xl bg-background-light px-2.5 py-3.5 transition active:bg-background-lighter'
    >
      <Image
        src={channel.metadata.image ?? ''}
        alt=''
        width={100}
        height={100}
        className='h-12 w-12 rounded-full object-cover'
      />
      <div className='flex flex-col gap-1.5'>
        <span className='font-bold'>{channel.metadata.title}</span>
        <span className='text-sm font-medium text-text-primary'>+23 memes</span>
      </div>
      <FaChevronRight className='ml-auto mr-1.5 text-xl text-text-muted' />
    </Link>
  )
}

function TopMemesToday() {
  const { data: topMemesIds, isLoading } = useGetTopMemes()

  const renderedMessageQueries = getPostQuery.useQueries(topMemesIds)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-0.5 px-4'>
        <h1 className='text-lg font-bold'>Top memes today</h1>
        <span className='text-sm font-medium text-text-muted'>
          Authors of the best memes earn 💎 20,000 points
        </span>
      </div>
      <div className='no-scroll flex items-center gap-3 overflow-auto px-4'>
        {isLoading && isEmptyArray(topMemesIds) ? (
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
