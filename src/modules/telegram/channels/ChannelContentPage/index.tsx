import Button from '@/components/Button'
import Container from '@/components/Container'
import SkeletonFallback from '@/components/SkeletonFallback'
import TabButtons from '@/components/TabButtons'
import MemeChatRoom from '@/components/chats/ChatRoom/MemeChatRoom'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import useAuthorizedForModeration from '@/hooks/useAuthorizedForModeration'
import { getGamificationTasksQuery } from '@/services/datahub/tasks/query'
import { useMyMainAddress } from '@/stores/my-account'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { FaChevronLeft } from 'react-icons/fa6'
import {
  ChannelContentPageProvider,
  useChannelContentPageContext,
} from './context'

export default function ChannelContentPage({
  rootPostId,
}: {
  rootPostId: string
}) {
  return (
    <ChannelContentPageProvider rootPostId={rootPostId}>
      <LayoutWithBottomNavigation withFixedHeight className='relative'>
        <ChannelNavbar />
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
        <div className='absolute top-14 z-10 h-full w-full bg-background transition data-[closed]:translate-x-1/2 data-[closed]:opacity-0'>
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
            <div className='absolute inset-x-0 bottom-0 h-10 w-full bg-gradient-to-b from-transparent to-background' />
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
              className='mt-6'
              tabs={['Details', 'Tasks']}
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
            </div>
          </Container>
        </div>
      </Transition>
    </>
  )
}

function ChannelTasks() {
  const myAddress = useMyMainAddress()
  const { contentContainer } = useChannelContentPageContext()
  const { data: gamificationTasks } = getGamificationTasksQuery.useQuery(
    {
      address: myAddress || '',
      rootSpaceId: contentContainer?.rootSpace.id || '',
    },
    { enabled: !!contentContainer?.rootSpace.id }
  )
  return (
    <div className='flex flex-col gap-2'>
      {/* {gamificationTasks?.data.map((task, index) => {
      const tag = task.tag

      const { image, title, event } = modalConfigByVariant[tag]

      return (
        <TaskCard
          key={index}
          image={image}
          onClick={() => {
            sendEvent(event)

            if (task !== undefined && !task.claimed) {
              clearGamificationTasksError(client)
              setModalVariant(tag)
            }
          }}
          title={title}
          openInNewTab
          reward={parseInt(task.rewardPoints ?? '0')}
          completed={task.claimed ?? false}
        />
      )
    })} */}
    </div>
  )
}
