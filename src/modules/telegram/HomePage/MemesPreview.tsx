import AddressAvatar from '@/components/AddressAvatar'
import LinkText from '@/components/LinkText'
import MediaLoader from '@/components/MediaLoader'
import Name from '@/components/Name'
import { Skeleton } from '@/components/SkeletonFallback'
import usePaginatedMessageIds from '@/components/chats/hooks/usePaginatedMessageIds'
import { getPostExtensionProperties } from '@/components/extensions/utils'
import { getPostQuery } from '@/services/api/query'
import { getPostsCountByTodayQuery } from '@/services/datahub/posts/query'
import { cx } from '@/utils/class-names'
import { PostData } from '@subsocial/api/types'
import { isEmptyArray } from '@subsocial/utils'
import Link from 'next/link'
import { useEffect } from 'react'
import SkeletonFallback from '../../../components/SkeletonFallback'

const memeCardSize = 'w-[150px] h-[160px] min-w-[150px]'

type MemesPreviewProps = {
  hubId: string
  chatId: string
}

const MemesPreview = ({ chatId, hubId }: MemesPreviewProps) => {
  const { messageIds, isLoading, loadMore } = usePaginatedMessageIds({
    hubId,
    chatId,
    onlyDisplayUnapprovedMessages: false,
  })

  const { data: postsCount, isLoading: isPostsCountLoading } =
    getPostsCountByTodayQuery.useQuery({ chatId })

  useEffect(() => {
    if (isEmptyArray(messageIds)) {
      loadMore()
    }
  }, [loadMore, messageIds])

  const renderedMessageQueries = getPostQuery.useQueries(messageIds)

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2 px-4'>
        <div className='flex items-center gap-2'>
          <span className='text-lg font-bold'>Memes</span>
          <SkeletonFallback
            isLoading={isPostsCountLoading}
            className='max-w-14'
          >
            <span className='font-semibold text-slate-400'>
              +{postsCount} today
            </span>
          </SkeletonFallback>
        </div>
        <LinkText variant='primary' href='/tg/memes'>
          See all
        </LinkText>
      </div>
      <div className='w-full overflow-hidden'>
        <div className='no-scroll flex items-center gap-3 overflow-auto px-4'>
          {isLoading && isEmptyArray(messageIds) ? (
            <MemesPreviewSkeleton />
          ) : (
            renderedMessageQueries
              .slice(0, 5)
              .map(({ data: message, isLoading }, index) => {
                if (!message) return null

                return isLoading ? (
                  <Skeleton
                    key={index}
                    className={cx('!my-0 rounded-xl', memeCardSize)}
                  />
                ) : (
                  <MemesPreviewItem key={index} message={message} />
                )
              })
          )}
          <Link
            href='/tg/channels'
            className={cx(
              'flex items-center justify-center rounded-xl bg-slate-800',
              memeCardSize
            )}
          >
            See all
          </Link>
        </div>
      </div>
    </div>
  )
}

export const MemesPreviewSkeleton = () => {
  const items = Array.from({ length: 5 })

  return (
    <>
      {items.map((_, i) => (
        <Skeleton key={i} className={cx('!my-0 rounded-xl', memeCardSize)} />
      ))}
    </>
  )
}

export const MemesPreviewItem = ({
  message,
  className,
  href,
  address,
}: {
  message: PostData
  className?: string
  href?: string
  address?: string
}) => {
  const { body, extensions } = message.content || {}

  if (!body && (!extensions || extensions.length === 0)) return null

  const imageExt = getPostExtensionProperties(
    extensions?.[0],
    'subsocial-image'
  )

  return (
    <Link
      href={href ? href : '/tg/channels'}
      className={cx('relative', memeCardSize, className)}
    >
      <MediaLoader
        containerClassName={cx(
          'overflow-hidden rounded-xl flex-1 justify-center flex items-center cursor-pointer',
          memeCardSize
        )}
        placeholderClassName={cx('w-full aspect-square')}
        className='object-contain '
        src={imageExt?.image}
      />
      {address && (
        <div
          className={cx(
            'absolute bottom-[10px] left-[10px] flex max-w-[100px] items-center gap-1 rounded-3xl bg-slate-700 p-[2px] pr-[6px]'
          )}
        >
          <AddressAvatar address={address} className='h-[20px] w-[20px]' />
          <Name address={address} clipText className='text-sm font-semibold' />
        </div>
      )}
    </Link>
  )
}

export default MemesPreview
