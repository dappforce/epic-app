import Button from '@/components/Button'
import Container from '@/components/Container'
import SkeletonFallback, { Skeleton } from '@/components/SkeletonFallback'
import TabButtons from '@/components/TabButtons'
import TaskCard from '@/components/TaskCard'
import MemeChatRoom from '@/components/chats/ChatRoom/MemeChatRoom'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import ClaimTaskModal from '@/components/tasks/ClaimTaskModal'
import { modalConfigByVariant } from '@/components/tasks/config'
import useAuthorizedForModeration from '@/hooks/useAuthorizedForModeration'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import {
  ContentContainer,
  getContentContainersQuery,
} from '@/services/datahub/content-containers/query'
import { ContentContainerType } from '@/services/datahub/generated-query'
import { GamificationTask } from '@/services/datahub/tasks'
import {
  clearGamificationTasksError,
  getGamificationTasksQuery,
} from '@/services/datahub/tasks/query'
import { useSendEvent } from '@/stores/analytics'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { getHumanReadableRelativeTime } from '@/utils/date'
import { Transition } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import HowToEarnMessage from './HowToEarnMessage'
import {
  ChannelContentPageProvider,
  useChannelContentPageContext,
} from './context'

export default function ChannelContentPage({
  rootPostId,
}: {
  rootPostId: string
}) {
  useTgNoScroll()

  return (
    <ChannelContentPageProvider rootPostId={rootPostId}>
      <LayoutWithBottomNavigation withFixedHeight className='relative'>
        <ChannelNavbar />
        <HowToEarnMessage />
        <ChatContent />
      </LayoutWithBottomNavigation>
    </ChannelContentPageProvider>
  )
}

function ChatContent() {
  const { contentContainer, isModerating } = useChannelContentPageContext()
  if (!contentContainer) return null

  return (
    <MemeChatRoom
      contentContainer={contentContainer}
      chatId={contentContainer.rootPost.id}
      shouldShowUnapproved={isModerating}
    />
  )
}

function ChannelNavbar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('Details')
  const router = useRouter()

  const {
    contentContainer,
    isLoading,
    rootPostId,
    isModerating,
    setIsModerating,
  } = useChannelContentPageContext()

  const myAddress = useMyMainAddress() ?? ''
  const canModerate = useAuthorizedForModeration(rootPostId, myAddress)

  return (
    <>
      <nav className='flex h-14 items-center gap-2.5 bg-background-light px-3'>
        <FaChevronLeft
          onClick={() => {
            if (isAboutOpen) setIsAboutOpen(false)
            else router.push('/tg/channels')
          }}
          className='text-lg text-text-muted'
        />
        <div
          className='flex items-center gap-2.5'
          onClick={() => setIsAboutOpen(true)}
        >
          <SkeletonFallback
            isLoading={isLoading}
            className='h-9 w-9 rounded-full'
          >
            <Image
              src={contentContainer?.metadata.image ?? ''}
              alt=''
              width={100}
              height={100}
              className='h-9 w-9 rounded-full'
            />
          </SkeletonFallback>
          <div className='flex flex-col gap-0.5'>
            <span className='font-bold'>
              {isAboutOpen && 'About '}
              <SkeletonFallback
                isLoading={isLoading}
                className='inline-block w-16 align-middle'
              >
                {contentContainer?.metadata.title}
              </SkeletonFallback>{' '}
              Channel
            </span>
            {canModerate && (
              <div className='flex'>
                <Button
                  variant={isModerating ? 'primary' : 'primaryOutline'}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsModerating(!isModerating)
                  }}
                  className='w-auto px-2 py-0.5 text-xs'
                >
                  Moderation Mode
                </Button>
              </div>
            )}
          </div>
        </div>
        {!isAboutOpen && (
          <AiOutlineInfoCircle
            onClick={() => setIsAboutOpen(true)}
            className='ml-auto text-xl text-text-muted'
          />
        )}
      </nav>
      <Transition show={isAboutOpen}>
        <div className='absolute top-14 z-20 h-screen w-full overflow-auto bg-background pb-32 transition data-[closed]:translate-x-1/2 data-[closed]:opacity-0'>
          <div className='relative mb-8 h-40 w-full bg-background-light'>
            <div className='h-full w-full overflow-clip'>
              {contentContainer?.metadata.coverImage && (
                <Image
                  src={contentContainer?.metadata.coverImage ?? ''}
                  alt=''
                  width={1000}
                  height={1000}
                  className='h-full w-full scale-125 object-cover'
                />
              )}
            </div>
            <div className='absolute bottom-2 left-2 translate-y-1/2 rounded-full bg-background p-1'>
              <SkeletonFallback
                isLoading={isLoading}
                className='h-[90px] w-[90px] rounded-full'
              >
                <Image
                  width={100}
                  height={100}
                  src={contentContainer?.metadata.image ?? ''}
                  className='h-[90px] w-[90px] rounded-full object-cover'
                  alt=''
                />
              </SkeletonFallback>
            </div>
          </div>
          <Container className='flex flex-col pt-6'>
            <span className='text-2xl font-bold'>
              <SkeletonFallback
                isLoading={isLoading}
                className='inline-block w-16 align-middle'
              >
                {contentContainer?.metadata.title}
              </SkeletonFallback>{' '}
              Channel
            </span>
            <TabButtons
              className='mt-4'
              tabs={['Details', 'Tasks', 'Contests']}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            <div className='py-4'>
              {selectedTab === 'Details' && (
                <SkeletonFallback isLoading={isLoading} className='h-16 w-full'>
                  <p className='whitespace-pre-wrap leading-snug text-text-muted'>
                    {contentContainer?.metadata.description}
                  </p>
                </SkeletonFallback>
              )}
              {selectedTab === 'Tasks' && <ChannelTasks />}
              {selectedTab === 'Contests' && contentContainer && (
                <ContestList channel={contentContainer} />
              )}
            </div>
          </Container>
        </div>
      </Transition>
    </>
  )
}

function ContestList({ channel }: { channel: ContentContainer }) {
  const { data } = getContentContainersQuery.useQuery(
    {
      filter: {
        containerType: [ContentContainerType.Contest],
        rootSpaceId: channel.rootSpace?.id ?? '',
      },
    },
    {
      enabled: !!channel.rootSpace?.id,
    }
  )
  return (
    <div className='flex flex-col gap-2'>
      {data?.data.map((contest) => (
        <Contest key={contest.id} contest={contest} />
      ))}
    </div>
  )
}

function Contest({ contest }: { contest: ContentContainer }) {
  useTgNoScroll()

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
        className='h-12 w-12 rounded-full object-cover'
      />
      <div className='flex flex-col gap-1'>
        <span className='font-bold'>{contest.metadata.title}</span>
        <span className='text-sm text-text-muted'>
          {contest.metadata.description}
        </span>
        <div className='flex items-center gap-3'>
          <ContestStatus contest={contest} className='text-sm' />
        </div>
      </div>
      <FaChevronRight className='ml-auto mr-1.5 text-xl text-text-muted' />
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

function ChannelTasks() {
  const myAddress = useMyMainAddress()
  const { contentContainer } = useChannelContentPageContext()
  const {
    data: gamificationTasks,
    isLoading,
    isSuccess,
  } = getGamificationTasksQuery.useQuery(
    {
      address: myAddress || '',
      rootSpaceId: contentContainer?.rootSpace?.id || '',
    },
    { enabled: !!contentContainer?.rootSpace?.id }
  )
  const sendEvent = useSendEvent()
  const client = useQueryClient()

  const [isOpenTaskModal, setIsOpenTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<GamificationTask | null>(
    null
  )

  return (
    <div className='flex flex-col gap-2'>
      {isLoading &&
        Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className='h-16 w-full rounded-xl' />
        ))}
      {isSuccess && !gamificationTasks.data.length && (
        <div className='mt-4 text-center font-medium text-text-muted'>
          No tasks available
        </div>
      )}
      {gamificationTasks?.data.map((task, index) => {
        const taskConfig = modalConfigByVariant[task.name]
        const config = taskConfig?.(task)

        return (
          <TaskCard
            key={index}
            image={config.image}
            onClick={() => {
              sendEvent(config.event)

              if (task !== undefined && !task.claimed) {
                clearGamificationTasksError(client)
                setIsOpenTaskModal(true)
                setSelectedTask(task)
              }
            }}
            title={config.title}
            openInNewTab
            reward={parseInt(task.rewardPoints ?? '0')}
            completed={task.claimed ?? false}
          />
        )
      })}
      {selectedTask && (
        <ClaimTaskModal
          isOpen={isOpenTaskModal}
          task={selectedTask}
          close={() => setIsOpenTaskModal(false)}
        />
      )}
    </div>
  )
}
