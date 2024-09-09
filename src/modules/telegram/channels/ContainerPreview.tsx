import Calendar from '@/assets/emojis/calendar.png'
import Finish from '@/assets/emojis/finish.png'
import MoneyBag from '@/assets/emojis/moneybag.png'
import Time from '@/assets/emojis/time.png'
import Trophy from '@/assets/emojis/trophy.png'
import { Skeleton } from '@/components/SkeletonFallback'
import ChatUnreadCount from '@/components/chats/ChatPreview/ChatUnreadCount'
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
        <ContestInfoPreview contest={contest} className='mt-0.5' />
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
    return (
      <div className='flex items-center gap-1'>
        <Image src={Finish} alt='' className='h-3.5 w-3.5' />
        <span className={cx('font-medium', className)}>Finished</span>
      </div>
    )
  } else if (!contest.openAt) {
    return (
      <div className='flex items-center gap-1'>
        <Image src={Calendar} alt='' className='h-3.5 w-3.5' />
        <span className={cx('font-medium', className)}>
          Starts in {getHumanReadableRelativeTime(contest.expirationWindowFrom)}
        </span>
      </div>
    )
  } else {
    return (
      <div className='flex items-center gap-1'>
        <Image src={Time} alt='' className='h-3.5 w-3.5' />
        <span className={cx('font-medium text-text-warning', className)}>
          {getHumanReadableRelativeTime(contest.expirationWindowTo)} left
        </span>
      </div>
    )
  }
}

export function ContestInfoPreview({
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
        <div className='flex items-center gap-1'>
          <Image src={MoneyBag} alt='' className='h-3.5 w-3.5' />
          <span>
            {formatNumber(
              formatBalanceToNumber(
                contest.metadata.rewardPoolAmount,
                contest.externalToken?.decimals ?? 0
              ),
              { shorten: true }
            )}{' '}
            {contest.metadata.isExternalTokenRewardPool
              ? contest.externalToken?.name ?? 'Tokens'
              : 'Points'}
          </span>
        </div>
      )}
      {!!contest.metadata.winnersNumber && (
        <div className='flex items-center gap-1'>
          <Image src={Trophy} alt='' className='h-3.5 w-3.5' />
          <span>{contest.metadata.winnersNumber}</span>
        </div>
      )}
    </div>
  )
}
