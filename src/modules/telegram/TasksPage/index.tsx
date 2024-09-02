import Calendar from '@/assets/graphics/tasks/calendar.png'
import Like from '@/assets/graphics/tasks/like.png'
import LinkText from '@/components/LinkText'
import TaskCard from '@/components/TaskCard'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import DailyRewardModal from '@/components/modals/DailyRewardModal'
import ClaimTaskModal from '@/components/tasks/ClaimTaskModal'
import {
  ClaimModalVariant,
  modalConfigByVariant,
} from '@/components/tasks/config'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import LikeCount from '@/modules/points/LikePreview'
import PointsWidget from '@/modules/points/PointsWidget'
import { getServerDayQuery } from '@/services/api/query'
import {
  getDailyRewardQuery,
  getTodaySuperLikeCountQuery,
  getTokenomicsMetadataQuery,
} from '@/services/datahub/content-staking/query'
import { GamificationTask } from '@/services/datahub/tasks'
import {
  clearGamificationTasksError,
  getGamificationTasksQuery,
} from '@/services/datahub/tasks/query'
import { useSendEvent } from '@/stores/analytics'
import { useMyMainAddress } from '@/stores/my-account'
import { formatNumber } from '@/utils/strings'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import SkeletonFallback from '../../../components/SkeletonFallback'

export default function TasksPage() {
  useTgNoScroll()

  return (
    <LayoutWithBottomNavigation className='relative' withFixedHeight>
      <PointsWidget
        isNoTgScroll
        withPointsAnimation={false}
        className='sticky top-0'
      />
      <div className='flex flex-1 flex-col gap-8 overflow-auto px-4 py-8'>
        <InviteFriendsTasks />
        <DailyTasks />
        <BasicTasks />
        <NewTasks />
      </div>
    </LayoutWithBottomNavigation>
  )
}

export function DailyTasks({ withTitle = true }: { withTitle?: boolean }) {
  const sendEvent = useSendEvent()
  const [isOpen, setIsOpen] = useState(false)
  const myAddress = useMyMainAddress() ?? ''

  const { data: tokenomics } = getTokenomicsMetadataQuery.useQuery(null)
  const pointsPerSuperLike = tokenomics
    ? (tokenomics.likerRewardDistributionPercent / 100) *
      Number(tokenomics.superLikeWeightPoints)
    : 4000

  const { data: serverDay, isLoading: loadingServerDay } =
    getServerDayQuery.useQuery(null)
  const { data: dailyReward, isLoading: loadingDailyReward } =
    getDailyRewardQuery.useQuery(myAddress ?? '')
  let todayRewardIndex = dailyReward?.claims.findIndex(
    (claim) => Number(claim.claimValidDay) === serverDay?.day
  )
  // if today is not in the list, then its a case where the fe invalidates the claim data after claimed the last day
  todayRewardIndex =
    todayRewardIndex === -1
      ? (dailyReward?.claims.length ?? 1) - 1
      : todayRewardIndex

  const todayReward = dailyReward?.claims[todayRewardIndex || 0]
  const isTodayRewardClaimed = !!todayReward && !todayReward.openToClaim

  const { data: superLikeCount } = getTodaySuperLikeCountQuery.useQuery(
    myAddress ?? ''
  )

  let todayRewardPoints: string | number = Number(
    todayReward?.claimRewardPoints ?? 0
  )
  if (
    todayReward?.claimRewardPointsRange &&
    todayReward?.claimRewardPointsRange?.length > 0
  ) {
    todayRewardPoints = `${formatNumber(
      todayReward.claimRewardPointsRange[0]
    )} - ${formatNumber(todayReward.claimRewardPointsRange[1])}`
  }

  return (
    <>
      <DailyRewardModal isOpen={isOpen} close={() => setIsOpen(false)} />
      <div className='flex flex-col gap-5'>
        {withTitle && (
          <span className='self-center text-lg font-bold text-slate-300'>
            Daily
          </span>
        )}
        <div className='flex flex-col gap-2'>
          <TaskCard
            onClick={() => {
              sendEvent('tasks_daily_reward_open')
              setIsOpen(true)
            }}
            image={Calendar}
            title='Check in'
            reward={todayRewardPoints}
            completed={isTodayRewardClaimed}
            isLoadingReward={loadingServerDay || loadingDailyReward}
            customAction={
              <span className='flex w-fit items-center font-bold'>
                <SkeletonFallback
                  isLoading={loadingServerDay || loadingDailyReward}
                  className='w-fit min-w-[40px]'
                >
                  {(todayRewardIndex || 0) + 1}
                </SkeletonFallback>
                /7
              </span>
            }
          />
          <TaskCard
            image={Like}
            onClick={() => {
              sendEvent('tasks_like_open')
            }}
            title='Like 10 memes'
            href='/tg/memes'
            reward={pointsPerSuperLike * 10}
            completed={(superLikeCount?.count ?? 0) >= 10}
            customAction={
              <span className='font-bold'>
                <LikeCount />
                /10
              </span>
            }
          />
        </div>
      </div>
    </>
  )
}

const inviteFriendsTasksName = 'INVITE_REFERRALS'

function InviteFriendsTasks() {
  const myAddress = useMyMainAddress()
  const sendEvent = useSendEvent()
  const [isOpenClaimTaskModal, setIsOpenClaimTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<GamificationTask | null>(
    null
  )
  const client = useQueryClient()

  const { data: gamificationTasks } = getGamificationTasksQuery.useQuery({
    address: myAddress || '',
    rootSpaceId: '',
  })

  const data =
    gamificationTasks?.data?.filter(
      (item) => item.name === inviteFriendsTasksName
    ) || []

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-0.5'>
        <span className='self-center text-lg font-bold text-slate-300'>
          Invite friends
        </span>
        <span className='self-center text-center text-sm text-slate-400'>
          For each{' '}
          <LinkText
            variant='primary'
            className='hover:no-underline'
            href='/tg/friends'
          >
            friend you invite
          </LinkText>
          , you earn 200K Points. You can earn additional points by completing
          the tasks:
        </span>
      </div>
      <div className='flex flex-col gap-2'>
        {data.map((task, index) => {
          const { image, title, event } =
            modalConfigByVariant[task.name]?.(task)

          return (
            <TaskCard
              key={index}
              image={image}
              onClick={() => {
                sendEvent(event)

                if (task !== undefined && !task.claimed) {
                  clearGamificationTasksError(client)
                  setIsOpenClaimTaskModal(true)
                  setSelectedTask(task)
                }
              }}
              title={title}
              openInNewTab
              reward={parseInt(task.rewardPoints ?? '0')}
              completed={task.claimed ?? false}
            />
          )
        })}
      </div>
      {selectedTask && (
        <ClaimTaskModal
          task={selectedTask}
          isOpen={isOpenClaimTaskModal}
          close={() => setIsOpenClaimTaskModal(false)}
        />
      )}
    </div>
  )
}

const basicTasksNames = ['JOIN_TELEGRAM_CHANNEL', 'JOIN_TWITTER']

function BasicTasks() {
  const sendEvent = useSendEvent()
  const [isOpenClaimTaskModal, setIsOpenClaimTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<GamificationTask | null>(
    null
  )

  const myAddress = useMyMainAddress()
  const client = useQueryClient()

  const { data: gamificationTasks } = getGamificationTasksQuery.useQuery({
    address: myAddress || '',
    rootSpaceId: '',
  })

  const data =
    gamificationTasks?.data?.filter((item) =>
      basicTasksNames.includes(item.name)
    ) || []

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex flex-col gap-0.5'>
        <span className='self-center text-lg font-bold text-slate-300'>
          Main Tasks
        </span>
        <span className='self-center text-center text-sm text-slate-400'>
          Join our social media and receive rewards later
        </span>
      </div>
      <div className='flex flex-col gap-2'>
        {data.map((task, index) => {
          const tag = task.tag as Exclude<ClaimModalVariant, null>

          const variant = modalConfigByVariant[tag]?.(task)
          if (!variant) return null
          const { image, title, event } = variant || {}

          return (
            <TaskCard
              key={index}
              image={image}
              onClick={() => {
                sendEvent(event)

                if (task !== undefined && !task.claimed) {
                  clearGamificationTasksError(client)
                  setIsOpenClaimTaskModal(true)
                  setSelectedTask(task)
                }
              }}
              title={title}
              openInNewTab
              reward={parseInt(task.rewardPoints ?? '0')}
              completed={task.claimed ?? false}
            />
          )
        })}
      </div>
      {selectedTask && (
        <ClaimTaskModal
          task={selectedTask}
          isOpen={isOpenClaimTaskModal}
          close={() => setIsOpenClaimTaskModal(false)}
        />
      )}
    </div>
  )
}

function NewTasks() {
  return (
    <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
      <span className='font-bold'>🕔 New Tasks Soon!</span>
      <span className='text-sm font-medium text-text-muted'>
        Don’t miss them
      </span>
    </div>
  )
}
