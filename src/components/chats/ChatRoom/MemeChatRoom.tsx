import Shield from '@/assets/icons/shield.svg'
import Button from '@/components/Button'
import LinkText from '@/components/LinkText'
import Notice from '@/components/Notice'
import ChatRoom from '@/components/chats/ChatRoom'
import LinkEvmAddressModal from '@/components/modals/LinkEvmAddressModal'
import Meme2EarnIntroModal, {
  hasOpenedMeme2EarnIntroStorage,
} from '@/components/modals/Meme2EarnIntroModal'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import { env } from '@/env.mjs'
import useIsAddressBlockedInChat from '@/hooks/useIsAddressBlockedInChat'
import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import usePostMemeThreshold from '@/hooks/usePostMemeThreshold'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { getTimeLeftUntilCanPostQuery } from '@/services/datahub/posts/query'
import { useSendEvent } from '@/stores/analytics'
import { useExtensionData } from '@/stores/extension'
import { useMessageData } from '@/stores/message'
import { useMyMainAddress } from '@/stores/my-account'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { LuPlusCircle } from 'react-icons/lu'

export default function MemeChatRoom({
  chatId,
  shouldShowUnapproved,
  isContest,
}: {
  chatId: string
  shouldShowUnapproved: boolean
  isContest?: { isContestEnded: boolean }
}) {
  const [isOpenRules, setIsOpenRules] = useState(false)
  const isCannotPost = isContest?.isContestEnded || shouldShowUnapproved

  return (
    <>
      <ChatRoom
        chatId={chatId}
        hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
        className='overflow-hidden'
        disableSuperLike={isContest?.isContestEnded}
        onlyDisplayUnapprovedMessages={shouldShowUnapproved}
        customAction={
          isCannotPost ? (
            <></>
          ) : (
            <div className='grid grid-cols-[max-content_1fr] gap-2 px-2'>
              <Button
                type='button'
                size='lg'
                className='flex items-center justify-center gap-2 py-2.5'
                variant='bgLighter'
                onClick={() => setIsOpenRules(true)}
              >
                {isContest ? (
                  <span className='text-text'>Contest Rules</span>
                ) : (
                  <>
                    <Shield className='text-text-muted' />
                    <span className='text-text'>Rules</span>
                  </>
                )}
              </Button>
              <PostMemeButton isContestTab={!!isContest} chatId={chatId} />
            </div>
          )
        }
      />
      <RulesModal
        isContest={!!isContest}
        isOpen={isOpenRules}
        closeModal={() => setIsOpenRules(false)}
      />
    </>
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
function PostMemeButton({
  chatId,
  isContestTab,
}: {
  chatId: string
  isContestTab: boolean
}) {
  const sendEvent = useSendEvent()
  const [isOpenIntroModal, setIsOpenIntroModal] = useState(false)
  const [isOpenLinkEvm, setIsOpenLinkEvm] = useState(false)
  const openExtensionModal = useExtensionData.use.openExtensionModal()

  const myAddress = useMyMainAddress() ?? ''
  const { data, isLoading } = getBalanceQuery.useQuery(myAddress)

  const {
    data: timeLeftFromApi,
    isLoading: loadingTimeLeft,
    refetch,
  } = getTimeLeftUntilCanPostQuery.useQuery(myAddress)
  useEffect(() => {
    const listener = () => {
      if (document.visibilityState === 'visible') refetch()
    }
    document.addEventListener('visibilitychange', listener, false)
    return () => {
      document.removeEventListener('visibilitychange', listener)
    }
  }, [refetch])

  const { threshold, isLoading: loadingThreshold } =
    usePostMemeThreshold(chatId)

  const { identityAddress, isLoading: loadingEvmAddress } =
    useLinkedEvmAddress()
  const { isBlocked, isLoading: loadingIsBlocked } = useIsAddressBlockedInChat(
    myAddress,
    chatId
  )

  const [timeLeft, setTimeLeft] = useState<number>(Infinity)
  useEffect(() => {
    if (typeof timeLeftFromApi?.timeLeft === 'number') {
      setTimeLeft(Math.max(timeLeftFromApi.timeLeft, 0))
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
    !loadingThreshold &&
    data &&
    data >= parseInt(threshold ?? '0')
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
          loadingThreshold ||
          loadingTimeLeft ||
          isTimeConstrained ||
          loadingIsBlocked ||
          (isContestTab && loadingEvmAddress)
        }
        type='button'
        className='flex items-center justify-center gap-2 px-0 py-2.5 disabled:border-none disabled:bg-background-light/30 disabled:text-text-muted/50 disabled:!brightness-100'
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
            if (!identityAddress && isContestTab) {
              setIsOpenLinkEvm(true)
              return
            }
            openExtensionModal('subsocial-image', null)
          } else {
            useMessageData
              .getState()
              .setOpenMessageModal('not-enough-balance', chatId)
          }
        }}
      >
        {!isTimeConstrained ? (
          <>
            <LuPlusCircle className='text-lg' />
            <span>Post Meme</span>
          </>
        ) : (
          <>
            {/* <FaRegClock className='text-lg' /> */}
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
      <LinkEvmAddressModal
        isOpen={isOpenLinkEvm}
        closeModal={() => setIsOpenLinkEvm(false)}
      />
    </>
  )
}

function RulesModal({
  isContest,
  ...props
}: ModalFunctionalityProps & { isContest: boolean }) {
  return (
    <Modal {...props} title='Rules' withCloseButton>
      <div className='flex flex-col gap-6'>
        <ul className='flex list-none flex-col gap-3.5 text-text-muted'>
          {isContest ? (
            <>
              <li>🤣 Post memes only about memecoins</li>
              <li>⏰ Contest is open for 1 week</li>
              <li>🤑 300 USD in $PEPE prize pool </li>
              <li className='flex gap-1'>
                <span>🏆</span>
                <div className='flex flex-col gap-1'>
                  <span>15 winners x $20 in $PEPE:</span>
                  <span>10 chosen by most likes / 5 by EPIC</span>
                </div>
              </li>
              <li className='border border-b border-background-lighter' />
              <li>🚫 No sharing personal information</li>
              <li>🚫 No adult content</li>
              <li>🚫 No spam, no scam</li>
              <li>🚫 No violence</li>
            </>
          ) : (
            <>
              <li>🤣 Post funny memes</li>
              <li>🌟 Be polite and respect others</li>
              <li>🚫 No sharing personal information</li>
              <li>🚫 No adult content</li>
              <li>🚫 No spam, no scam</li>
              <li>🚫 No violence</li>
            </>
          )}
        </ul>
        <Notice noticeType='warning'>
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
