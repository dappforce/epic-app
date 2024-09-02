import ReferralTask from '@/assets/graphics/tasks/referral-task.png'
import Telegram from '@/assets/graphics/tasks/telegram.png'
import TwitterX from '@/assets/graphics/tasks/twitter-x.png'
import LinkText from '@/components/LinkText'
import SkeletonFallback from '@/components/SkeletonFallback'
import { getUserReferralStatsQuery } from '@/services/datahub/leaderboard/query'
import { GamificationTask } from '@/services/datahub/tasks'
import { useMyMainAddress } from '@/stores/my-account'
import { LocalStorage } from '@/utils/storage'
import { ImageProps } from 'next/image'
import { FiArrowUpRight } from 'react-icons/fi'

export type ClaimModalVariant =
  | 'JOIN_TELEGRAM_CHANNEL'
  | 'JOIN_TWITTER'
  | 'INVITE_REFERRALS'
  | null

export const claimTaskErrorStore = new LocalStorage(() => 'claim-tasks-error')

type ModalConfig = {
  image: ImageProps['src']
  title: React.ReactNode
  stepsWithOrangeText?: number[]
  steps: React.ReactNode[]
  event: string
}

type ReferralTaskModalProps = {
  aimRefCount: number
}
const ReferralTaskModalStepPart = ({ aimRefCount }: ReferralTaskModalProps) => {
  const myAddress = useMyMainAddress()
  const { data, isLoading } = getUserReferralStatsQuery.useQuery(
    myAddress || ''
  )

  const { refCount } = data || {}

  return (
    <span className='flex items-center'>
      (
      <SkeletonFallback isLoading={isLoading} className='w-6'>
        {refCount && refCount > aimRefCount ? aimRefCount : refCount}
      </SkeletonFallback>
      /{aimRefCount})
    </span>
  )
}

export const modalConfigByVariant: Record<
  Exclude<ClaimModalVariant, null>,
  (task: GamificationTask) => ModalConfig
> = {
  JOIN_TELEGRAM_CHANNEL: (task) => ({
    image: Telegram,
    title: 'Join Our Telegram Channel',
    event: 'tasks_telegram_open',
    steps: [
      <div key='join-channel' className='flex flex-col gap-2'>
        <span className='text-sm font-medium leading-none text-slate-200'>
          Join the channel:
        </span>
        <LinkText
          href='https://t.me/EpicAppNet'
          variant='primary'
          className='flex items-center gap-1.5 leading-none'
        >
          <span>@{task.metadata?.telegramChannelToJoin}</span>
          <FiArrowUpRight className='relative top-0.5 text-base' />
        </LinkText>
      </div>,
      <span key='claim-click' className='text-sm font-medium text-slate-200'>
        Click the button below to verify your task
      </span>,
    ],
  }),
  JOIN_TWITTER: (task) => ({
    image: TwitterX,
    title: 'Join Our Twitter',
    event: 'tasks_x_open',
    stepsWithOrangeText: [2],
    steps: [
      <div key='join-channel' className='flex flex-col gap-2'>
        <span className='text-sm font-medium leading-none text-slate-200'>
          Follow us on X
        </span>
        <LinkText
          href='https://x.com/EpicAppNet'
          variant='primary'
          className='flex items-center gap-1.5 leading-none'
        >
          @{task.metadata?.twitterChannelToJoin}{' '}
          <FiArrowUpRight className='relative top-0.5 text-base' />
        </LinkText>
      </div>,
      <span key='claim-click' className='text-sm font-medium text-slate-200'>
        Click the button below to earn your reward.
      </span>,
      <span
        key='reward-granted'
        className='flex-1 text-sm font-medium text-orange-400'
      >
        If you&apos;re not subscribed, a penalty of 1M points will be deducted.
      </span>,
    ],
  }),
  INVITE_REFERRALS: (task: GamificationTask) => {
    const aimRefCount = task.metadata?.referralsNumberToAchieve || 0
    return {
      image: ReferralTask,
      tag: `INVITE_REFERRALS_${aimRefCount}_referrals_v1`,
      title: `Invite ${aimRefCount} Friends`,
      event: `tasks_referral_${aimRefCount}_open`,
      aim: aimRefCount,
      steps: [
        <span
          key='invite-friends'
          className='flex items-center gap-2 text-sm font-medium text-slate-200'
        >
          <LinkText
            href='/tg/friends'
            variant={'primary'}
            className='hover:no-underline'
          >
            Invite {aimRefCount} friends to join
          </LinkText>{' '}
          <ReferralTaskModalStepPart aimRefCount={aimRefCount} />
        </span>,
        <span key='claim-click' className='text-sm font-medium text-slate-200'>
          Click the button below to earn your reward.
        </span>,
      ],
    }
  },
}
