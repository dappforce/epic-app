import Diamond from '@/assets/emojis/diamond.png'
import Button from '@/components/Button'
import LinkEvmAddressModal from '@/components/modals/LinkEvmAddressModal'
import Meme2EarnIntroModal, {
  hasOpenedMeme2EarnIntroStorage,
} from '@/components/modals/Meme2EarnIntroModal'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import useIsAddressBlockedInChat from '@/hooks/useIsAddressBlockedInChat'
import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import usePostMemeThreshold from '@/hooks/usePostMemeThreshold'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import { useSyncExternalTokenBalances } from '@/services/datahub/externalTokenBalances/mutation'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { getTimeLeftUntilCanPostQuery } from '@/services/datahub/posts/query'
import { useSendEvent } from '@/stores/analytics'
import { useExtensionData } from '@/stores/extension'
import { useMessageData } from '@/stores/message'
import { useMyMainAddress } from '@/stores/my-account'
import { formatNumber } from '@/utils/strings'
import dayjs from 'dayjs'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { LuPlusCircle } from 'react-icons/lu'
import useTokenGatedRequirement from '../hooks/useTokenGatedRequirement'

function countdownText(timeLeft: number) {
  const timeDuration = dayjs.duration({ milliseconds: timeLeft })
  const minutes = Math.floor(timeDuration.asMinutes())
  const seconds = Math.floor(timeDuration.asSeconds()) - minutes * 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}
export default function PostMemeButton({
  chatId,
  isContestTab,
  contentContainer,
}: {
  chatId: string
  isContestTab: boolean
  contentContainer?: ContentContainer
}) {
  const { isLoading: loadingTokenGated, passRequirement } =
    useTokenGatedRequirement(contentContainer)

  const sendEvent = useSendEvent()
  const [isOpenIntroModal, setIsOpenIntroModal] = useState(false)
  const [isOpenLinkEvm, setIsOpenLinkEvm] = useState(false)
  const [isOpenTokenGatedModal, setIsOpenTokenGatedModal] = useState(false)
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

  const { evmAddress, isLoading: loadingEvmAddress } = useLinkedEvmAddress()
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
          loadingTokenGated ||
          (isContestTab && loadingEvmAddress)
        }
        type='button'
        className='flex items-center justify-center gap-2 px-0 py-2.5 disabled:border-none disabled:bg-background-light/30 disabled:text-text-muted/50 disabled:!brightness-100'
        size='lg'
        variant={isMoreThanThreshold ? 'primary' : 'primaryOutline'}
        onClick={() => {
          if (passRequirement) {
            sendEvent('post_meme_token_gated_modal_opened')
            setIsOpenTokenGatedModal(true)
            return
          }

          if (isMoreThanThreshold) {
            if (hasOpenedMeme2EarnIntroStorage.get() !== 'true') {
              sendEvent('meme2earn_intro_modal_opened')
              setIsOpenIntroModal(true)
              hasOpenedMeme2EarnIntroStorage.set('true')
              return
            }
            if (!evmAddress && isContestTab) {
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
      {contentContainer && (
        <TokenGatedModal
          contentContainer={contentContainer}
          isOpen={isOpenTokenGatedModal}
          closeModal={() => setIsOpenTokenGatedModal(false)}
        />
      )}
    </>
  )
}

function TokenGatedModal({
  contentContainer,
  ...props
}: ModalFunctionalityProps & { contentContainer: ContentContainer }) {
  const { amountRequired, requiredToken } =
    useTokenGatedRequirement(contentContainer)
  const sendEvent = useSendEvent()
  const { mutate: syncExternalTokenBalances } = useSyncExternalTokenBalances()

  return (
    <Modal
      {...props}
      title='🔒 Hold Up, Meme Master!'
      description={`You need at least ${formatNumber(
        amountRequired
      )} ${requiredToken} to unlock meme-posting powers in this channel.`}
    >
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-background-lighter p-4'>
          <span className='text-center font-medium text-text-muted'>
            Required amount:
          </span>
          <div className='-ml-2 flex items-center gap-2.5'>
            <Image src={Diamond} alt='' className='h-12 w-12' />
            <span className='flex items-center text-3xl font-bold'>
              {formatNumber(amountRequired)} {requiredToken}
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-3 text-text-muted'>
          <div className='flex items-center gap-4'>
            <span className='font-medium text-text-muted'>
              Already got the magic tokens? Click the button below to verify
              your balance and start casting your memes!
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <Button
            size='lg'
            onClick={() => {
              if (contentContainer.externalToken?.id) {
                syncExternalTokenBalances({
                  externalTokenId: contentContainer.externalToken?.id,
                })
              }
            }}
          >
            I have the token in my wallet!
          </Button>
          <Button
            variant='primaryOutline'
            size='lg'
            onClick={() => {
              props.closeModal()
            }}
          >
            Buy {requiredToken}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
