import Calendar from '@/assets/emojis/calendar.png'
import Finish from '@/assets/emojis/finish.png'
import MoneyBag from '@/assets/emojis/moneybag.png'
import Time from '@/assets/emojis/time.png'
import Trophy from '@/assets/emojis/trophy.png'
import Button from '@/components/Button'
import Container from '@/components/Container'
import SkeletonFallback from '@/components/SkeletonFallback'
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
import { formatBalanceToNumber } from '@/utils/formatBalance'
import { formatNumber } from '@/utils/strings'
import { Transition } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { FaChevronLeft } from 'react-icons/fa6'
import ContainerSkeleton, {
  ChannelPreview,
  ContestInfoPreview,
  ContestPreview,
} from '../ContainerPreview'
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
  const [selectedTab, setSelectedTab] = useState('Tasks')
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

  const isContest =
    contentContainer?.containerType === ContentContainerType.Contest

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
            <div className='flex items-center gap-2'>
              <span className='line-clamp-1 font-bold'>
                {isAboutOpen && 'About '}
                <SkeletonFallback
                  isLoading={isLoading}
                  className='inline-block w-16 align-middle'
                >
                  {contentContainer?.metadata.title}
                </SkeletonFallback>{' '}
                {isContest ? 'Contest' : 'Channel'}
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
                    {isModerating ? 'Moderating' : 'Moderate'}
                  </Button>
                </div>
              )}
            </div>
            {isContest && <ContestInfoPreview contest={contentContainer} />}
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
              {isContest ? 'Contest' : 'Channel'}
            </span>
            {isContest && (
              <ContestInfo contest={contentContainer} className='mb-2 mt-4' />
            )}
            <TabButtons
              className='mt-4'
              tabs={[
                'Tasks',
                'Details',
                isContest ? 'Related Channels' : 'Contests',
              ]}
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
              {selectedTab === 'Related Channels' && contentContainer && (
                <RelatedChannelsList container={contentContainer} />
              )}
            </div>
          </Container>
        </div>
      </Transition>
    </>
  )
}

function ContestInfo({
  contest,
  className,
}: {
  contest: ContentContainer
  className?: string
}) {
  return (
    <div className={cx('flex items-center gap-10', className)}>
      <div className='flex flex-col gap-1'>
        {(() => {
          if (contest.closedAt) {
            return (
              <>
                <div className='flex items-center gap-1.5'>
                  <Image src={Finish} alt='' className='h-6 w-6' />
                  <span className='text-xl font-bold'>Finished</span>
                </div>
                <span className='text-sm text-text-muted'>Contest Status</span>
              </>
            )
          } else if (!contest.openAt) {
            return (
              <>
                <div className='flex items-center gap-1.5'>
                  <Image src={Calendar} alt='' className='h-6 w-6' />
                  <span className='text-xl font-bold'>
                    {getHumanReadableRelativeTime(contest.expirationWindowFrom)}
                  </span>
                </div>
                <span className='text-sm text-text-muted'>Starts in</span>
              </>
            )
          } else {
            return (
              <>
                <div className='flex items-center gap-1.5'>
                  <Image src={Time} alt='' className='h-6 w-6' />
                  <span className='text-xl font-bold'>
                    {getHumanReadableRelativeTime(contest.expirationWindowTo)}
                  </span>
                </div>
                <span className='text-sm text-text-muted'>Finished in</span>
              </>
            )
          }
        })()}
      </div>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1.5'>
          <Image src={Trophy} alt='' className='h-6 w-6' />
          <span className='text-xl font-bold'>
            {contest.metadata.winnersNumber}
          </span>
        </div>
        <span className='text-sm text-text-muted'>Winners</span>
      </div>
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-1.5'>
          <Image src={MoneyBag} alt='' className='h-6 w-6' />
          <span className='text-xl font-bold'>
            {formatNumber(
              formatBalanceToNumber(
                contest.metadata.rewardPoolAmount ?? '0',
                contest.externalToken?.decimals ?? 0
              ),
              { shorten: true }
            )}{' '}
            {contest.metadata.isExternalTokenRewardPool
              ? contest.externalToken?.name ?? 'Tokens'
              : 'Points'}
          </span>
        </div>
        <span className='text-sm text-text-muted'>Winners</span>
      </div>
    </div>
  )
}

function RelatedChannelsList({ container }: { container: ContentContainer }) {
  const { data, isLoading } = getContentContainersQuery.useQuery(
    {
      filter: {
        containerType: [
          ContentContainerType.CommunityChannel,
          ContentContainerType.PublicChannel,
        ],
        rootSpaceId: container.rootSpace?.id ?? '',
      },
    },
    {
      enabled: !!container.rootSpace?.id,
    }
  )
  return (
    <div className='flex flex-col gap-2'>
      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => <ContainerSkeleton key={i} />)}
      {data?.data.map((channel) => (
        <ChannelPreview withDescription key={channel.id} channel={channel} />
      ))}
    </div>
  )
}

function ContestList({ channel }: { channel: ContentContainer }) {
  const { data, isLoading } = getContentContainersQuery.useQuery(
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
      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => <ContainerSkeleton key={i} />)}
      {data?.data.map((contest) => (
        <ContestPreview key={contest.id} contest={contest} />
      ))}
    </div>
  )
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
          <ContainerSkeleton key={idx} />
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
