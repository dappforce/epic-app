import ChatUnreadCount from '@/components/chats/ChatPreview/ChatUnreadCount'
import { Skeleton } from '@/components/SkeletonFallback'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import { cx } from '@/utils/class-names'
import { getHumanReadableRelativeTime } from '@/utils/date'
import { formatBalanceToNumber } from '@/utils/formatBalance'
import { formatNumber } from '@/utils/strings'
import truncate from 'lodash.truncate'
import Image from 'next/image'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa6'

export default function ContainerSkeleton({
  className,
}: {
  className?: string
}) {
  return <Skeleton className={cx('h-16 w-full rounded-xl', className)} />
}

export function ChannelPreview({
  channel,
  withDescription,
}: {
  channel: ContentContainer
  withDescription?: boolean
}) {
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
        className='h-12 w-12 flex-shrink-0 rounded-full object-cover'
      />
      <div className='flex flex-col gap-1.5'>
        <span className='font-bold'>{channel.metadata.title}</span>
        {withDescription ? (
          <span className='line-clamp-1 text-sm text-text-muted'>
            {channel.metadata.description}
          </span>
        ) : (
          <ChatUnreadCount chatId={channel.rootPost.id}>
            {({ unreadCount, isLoading }) =>
              isLoading ? (
                <Skeleton className='w-20' />
              ) : (
                unreadCount > 0 && (
                  <span className='text-sm font-medium text-text-primary'>
                    +{formatNumber(unreadCount, { shorten: true })} memes
                  </span>
                )
              )
            }
          </ChatUnreadCount>
        )}
      </div>
      <FaChevronRight className='ml-auto mr-1.5 flex-shrink-0 text-xl text-text-muted' />
    </Link>
  )
}

export function ContestPreview({ contest }: { contest: ContentContainer }) {
  return (
    <Link
      href={`/tg/channels/${contest.rootPost.id}`}
      className='flex items-center gap-2.5 rounded-2xl bg-background-light px-2.5 py-3.5 transition active:bg-background-lighter'
    >
      <Image
        src={contest.metadata.image ?? ''}
        alt=''
        width={100}
        height={100}
        className='h-12 w-12 flex-shrink-0 rounded-full object-cover'
      />
      <div className='flex flex-col gap-1.5'>
        <span className='font-bold'>{contest.metadata.title}</span>
        <span className='text-sm text-text-muted'>
          {truncate(contest.metadata.description ?? '')}
        </span>
        <ContestDetails contest={contest} className='mt-0.5' />
      </div>
      <FaChevronRight className='ml-auto mr-1.5 flex-shrink-0 text-xl text-text-muted' />
    </Link>
  )
}

function ContestStatus({
  contest,
  className,
}: {
  contest: ContentContainer
  className?: string
}) {
  if (contest.closedAt) {
    return <span className={cx('font-medium', className)}>🏁 Finished</span>
  } else if (!contest.openAt) {
    return (
      <span className={cx('font-medium', className)}>
        📅 Starts in{' '}
        {getHumanReadableRelativeTime(contest.expirationWindowFrom)}
      </span>
    )
  } else {
    return (
      <span className={cx('font-medium text-text-warning', className)}>
        ⏳ {getHumanReadableRelativeTime(contest.expirationWindowTo)} left
      </span>
    )
  }
}

export function ContestDetails({
  contest,
  className,
}: {
  contest: ContentContainer
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex items-center gap-3 whitespace-nowrap text-sm font-medium',
        className
      )}
    >
      <ContestStatus contest={contest} />
      {!!contest.metadata.rewardPoolAmount && (
        <span>
          💰{' '}
          {formatNumber(
            formatBalanceToNumber(
              contest.metadata.rewardPoolAmount,
              contest.externalToken?.decimals ?? 0
            )
          )}{' '}
          {contest.metadata.isExternalTokenRewardPool
            ? contest.externalToken?.name ?? 'Tokens'
            : 'Points'}
        </span>
      )}
      {!!contest.metadata.winnersNumber && (
        <span>🏆 {contest.metadata.winnersNumber}</span>
      )}
    </div>
  )
}
