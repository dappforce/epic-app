import Shield from '@/assets/icons/shield.svg'
import Button from '@/components/Button'
import LinkText from '@/components/LinkText'
import Notice from '@/components/Notice'
import { Skeleton } from '@/components/SkeletonFallback'
import ChatRoom from '@/components/chats/ChatRoom'
import Meme2EarnIntroModal, {
  hasOpenedMeme2EarnIntroStorage,
} from '@/components/modals/Meme2EarnIntroModal'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import { env } from '@/env.mjs'
import useIsAddressBlockedInChat from '@/hooks/useIsAddressBlockedInChat'
import useIsModerationAdmin from '@/hooks/useIsModerationAdmin'
import PointsWidget from '@/modules/points/PointsWidget'
import { getServerTimeQuery } from '@/services/api/query'
import { getTokenomicsMetadataQuery } from '@/services/datahub/content-staking/query'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { getTimeLeftUntilCanPostQuery } from '@/services/datahub/posts/query'
import { useSendEvent } from '@/stores/analytics'
import { useExtensionData } from '@/stores/extension'
import { useMessageData } from '@/stores/message'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { ReactNode, useEffect, useState } from 'react'
import { LuPlusCircle } from 'react-icons/lu'

dayjs.extend(duration)

type Props = {
  className?: string
}

export default function ChatContent({ className }: Props) {
  const [selectedTab, setSelectedTab] = useState<TabState>('all')
  const [isOpenModal, setIsOpenModal] = useState(false)
  const { data: serverTime } = getServerTimeQuery.useQuery(null)
  const isContestEnded =
    selectedTab === 'contest' &&
    serverTime &&
    env.NEXT_PUBLIC_CONTEST_END_TIME < serverTime

  const chatId =
    selectedTab === 'all'
      ? env.NEXT_PUBLIC_MAIN_CHAT_ID
      : env.NEXT_PUBLIC_CONTEST_CHAT_ID

  return (
    <>
      <RulesModal
        isOpen={isOpenModal}
        closeModal={() => setIsOpenModal(false)}
      />
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <ChatRoom
        scrollableContainerClassName='pt-12'
        asContainer
        chatId={chatId}
        hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
        className='overflow-hidden'
        customAction={
          isContestEnded ? (
            <></>
          ) : (
            <div className='grid grid-cols-[max-content_1fr] gap-2'>
              <Button
                type='button'
                size='lg'
                className='flex items-center justify-center gap-2'
                variant='bgLighter'
                onClick={() => setIsOpenModal(true)}
              >
                <Shield className='relative top-px text-text-muted' />
                <span className='text-text'>Rules</span>
              </Button>
              <PostMemeButton chatId={chatId} />
            </div>
          )
        }
      />
    </>
  )
}

type TabState = 'all' | 'contest'
function TabButton({
  selectedTab,
  setSelectedTab,
  tab,
  children,
  className,
  size = 'md',
}: {
  tab: TabState
  selectedTab: TabState
  setSelectedTab: (tab: TabState) => void
  children: ReactNode
  className?: string
  size?: 'md' | 'sm'
}) {
  const isSelected = selectedTab === tab
  return (
    <Button
      variant={isSelected ? 'primary' : 'transparent'}
      className={cx(
        'h-10 py-0 text-sm',
        size === 'sm' ? 'h-8' : 'h-10',
        isSelected ? 'bg-background-primary/30' : '',
        className
      )}
      onClick={() => setSelectedTab(tab)}
    >
      {children}
    </Button>
  )
}

function Tabs({
  setSelectedTab,
  selectedTab,
}: {
  selectedTab: TabState
  setSelectedTab: (tab: TabState) => void
}) {
  const isAdmin = useIsModerationAdmin()
  const { data: serverTime, isLoading } = getServerTimeQuery.useQuery(null)
  const daysLeft = dayjs(env.NEXT_PUBLIC_CONTEST_END_TIME).diff(
    dayjs(serverTime ?? undefined),
    'days'
  )

  return (
    <div className='sticky top-14 grid h-14 grid-flow-col gap-1 bg-background px-4 py-2'>
      <TabButton
        tab='all'
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      >
        All memes
      </TabButton>
      <TabButton
        className='flex flex-col items-center justify-center text-center'
        tab='contest'
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      >
        <span>{env.NEXT_PUBLIC_CONTEST_NAME}</span>
        <span className='text-xs font-medium text-text-primary'>
          {(() => {
            if (isLoading || !serverTime) return <Skeleton className='w-16' />
            if (env.NEXT_PUBLIC_CONTEST_END_TIME < serverTime)
              return <span className='text-text-red'>Contest ended</span>
            if (daysLeft === 0) {
              const hoursLeft = dayjs(env.NEXT_PUBLIC_CONTEST_END_TIME).diff(
                dayjs(serverTime ?? undefined),
                'hours'
              )
              if (hoursLeft < 1) {
                return <span>Less than an hour left</span>
              }
              return <span>{hoursLeft} hours left</span>
            }
            return (
              <span>
                {daysLeft} day{daysLeft > 1 ? 's' : ''} left
              </span>
            )
          })()}
        </span>
      </TabButton>
    </div>
  )
}

function countdownText(timeLeft: number) {
  const timeDuration = dayjs.duration({ milliseconds: timeLeft })
  const minutes = Math.floor(timeDuration.asMinutes())
  const seconds = Math.floor(timeDuration.asSeconds()) - minutes * 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}
function PostMemeButton({ chatId }: { chatId: string }) {
  const sendEvent = useSendEvent()
  const [isOpenIntroModal, setIsOpenIntroModal] = useState(false)
  const openExtensionModal = useExtensionData.use.openExtensionModal()

  const myAddress = useMyMainAddress() ?? ''
  const { data, isLoading } = getBalanceQuery.useQuery(myAddress)
  const { data: timeLeftFromApi, isLoading: loadingTimeLeft } =
    getTimeLeftUntilCanPostQuery.useQuery(myAddress)
  const { data: tokenomics, isLoading: loadingTokenomics } =
    getTokenomicsMetadataQuery.useQuery(null)

  const { isBlocked, isLoading: loadingIsBlocked } = useIsAddressBlockedInChat(
    myAddress,
    chatId
  )

  const [timeLeft, setTimeLeft] = useState<number>(Infinity)
  useEffect(() => {
    if (typeof timeLeftFromApi === 'number') {
      setTimeLeft(Math.max(timeLeftFromApi, 0))
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = Math.max(prev - 1000, 0)
          if (next === 0) clearInterval(interval)
          return next
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timeLeftFromApi])

  const isMoreThanThreshold =
    !isLoading &&
    !loadingTokenomics &&
    data &&
    data >=
      parseInt(
        tokenomics?.socialActionBalanceThreshold.createCommentPoints ?? '0'
      )
  const isTimeConstrained =
    !loadingTimeLeft && timeLeft !== Infinity && (timeLeft ?? 0) > 0

  if (isBlocked) {
    return (
      <Button variant='muted' disabled>
        You are blocked in this chat
      </Button>
    )
  }

  return (
    <>
      <Button
        disabled={
          isLoading ||
          loadingTokenomics ||
          loadingTimeLeft ||
          isTimeConstrained ||
          loadingIsBlocked
        }
        type='button'
        className='flex items-center justify-center gap-2 px-0 disabled:border-none disabled:bg-background-light/30 disabled:text-text-muted/50 disabled:!brightness-100'
        size='lg'
        variant={isMoreThanThreshold ? 'primary' : 'primaryOutline'}
        onClick={() => {
          if (isMoreThanThreshold) {
            if (hasOpenedMeme2EarnIntroStorage.get() !== 'true') {
              sendEvent('meme2earn_intro_modal_opened')
              setIsOpenIntroModal(true)
              hasOpenedMeme2EarnIntroStorage.set('true')
              return
            }
            openExtensionModal('subsocial-image', null)
          } else {
            useMessageData.getState().setOpenMessageModal('not-enough-balance')
          }
        }}
      >
        {!isTimeConstrained ? (
          <>
            <LuPlusCircle className='relative top-px text-lg' />
            <span>Post Meme</span>
          </>
        ) : (
          <>
            {/* <FaRegClock className='relative top-px text-lg' /> */}
            <span>Posting available in: {countdownText(timeLeft)}</span>
          </>
        )}
      </Button>
      <Meme2EarnIntroModal
        isOpen={isOpenIntroModal}
        closeModal={() => {
          sendEvent('meme2earn_intro_modal_closed')
          setIsOpenIntroModal(false)
        }}
      />
    </>
  )
}

function RulesModal(props: ModalFunctionalityProps) {
  return (
    <Modal {...props} title='Rules' withCloseButton>
      <div className='flex flex-col gap-6'>
        <ul className='flex list-none flex-col gap-3.5 text-text-muted'>
          <li>🤣 Post funny memes</li>
          <li>🌟 Be polite and respect others</li>
          <li>🚫 No sharing personal information</li>
          <li>🚫 No adult content</li>
          <li>🚫 No spam, no scam</li>
          <li>🚫 No violence</li>
        </ul>
        <Notice noticeType='warning' className='font-medium'>
          ⚠️ All those who break these rules will be banned and will lose all
          their points.
        </Notice>
        <LinkText
          variant='secondary'
          className='text-center'
          href='/legal/content-policy'
        >
          Read the detailed information
        </LinkText>
        <Button size='lg' onClick={() => props.closeModal()}>
          Got it!
        </Button>
      </div>
    </Modal>
  )
}
