import Confused from '@/assets/emojis/confused.png'
import SuccessEmoji from '@/assets/emojis/success.png'
import BottomDrawer from '@/components/BottomDrawer'
import Button, { ButtonProps } from '@/components/Button'
import Card from '@/components/Card'
import Notice from '@/components/Notice'
import Meme2EarnIntroModal, {
  hasOpenedMeme2EarnIntroStorage,
} from '@/components/modals/Meme2EarnIntroModal'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import EvmConnectWalletModal from '@/components/wallets/evm/EvmConnectWalletModal'
import useIsAddressBlockedInChat from '@/hooks/useIsAddressBlockedInChat'
import useLinkedEvmAddress from '@/hooks/useLinkedProviders'
import usePostMemeThreshold from '@/hooks/usePostMemeThreshold'
import useToastError from '@/hooks/useToastError'
import SolanaButton from '@/modules/telegram/AirdropPage/solana'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import { useSyncExternalTokenBalances } from '@/services/datahub/externalTokenBalances/mutation'
import { ExternalTokenChain } from '@/services/datahub/generated-query'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { getTimeLeftUntilCanPostQuery } from '@/services/datahub/posts/query'
import { useSendEvent } from '@/stores/analytics'
import { useExtensionData } from '@/stores/extension'
import { useMessageData } from '@/stores/message'
import { useMyMainAddress } from '@/stores/my-account'
import { truncateAddress } from '@/utils/account'
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
          loadingTokenGated ||
          (isContestTab && loadingEvmAddress)
        }
        type='button'
        className='flex items-center justify-center gap-2 px-0 py-2.5 disabled:border-none disabled:bg-background-light/30 disabled:text-text-muted/50 disabled:!brightness-100'
        size='lg'
        variant={isMoreThanThreshold ? 'primary' : 'primaryOutline'}
        onClick={() => {
          if (!passRequirement) {
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
      <EvmConnectWalletModal
        isOpen={isOpenLinkEvm}
        closeModal={() => setIsOpenLinkEvm(false)}
      />
      {contentContainer && (
        <TokenGatedModal
          contentContainer={contentContainer}
          isOpen={isOpenTokenGatedModal}
          closeModal={() => setIsOpenTokenGatedModal(false)}
          openEvmLinkModal={() => setIsOpenLinkEvm(true)}
        />
      )}
    </>
  )
}

function TokenGatedModal({
  contentContainer,
  openEvmLinkModal,
  ...props
}: ModalFunctionalityProps & {
  contentContainer: ContentContainer
  openEvmLinkModal: () => void
}) {
  const {
    amountRequired,
    requiredToken,
    hasToLinkWallet,
    currentToken,
    passRequirement,
    remainingNeeded,
  } = useTokenGatedRequirement(contentContainer)
  const [isOpenSuccessModal, setIsOpenSuccessModal] = useState(false)
  const [isAfterSync, setIsAfterSync] = useState(false)

  const sendEvent = useSendEvent()

  const [isWaitingSyncDone, setIsWaitingSyncDone] = useState(false)
  useEffect(() => {
    if (props.isOpen) {
      setIsWaitingSyncDone(false)
      setIsAfterSync(false)
    }
  }, [props.isOpen])

  const {
    mutate: syncExternalTokenBalances,
    error,
    isLoading,
  } = useSyncExternalTokenBalances({
    onMutate: () => setIsWaitingSyncDone(true),
    onSuccessSync: () => {
      setIsWaitingSyncDone(false)
      setIsAfterSync(true)
      if (passRequirement) {
        setIsOpenSuccessModal(true)
      }
    },
    onError: () => {
      setIsWaitingSyncDone(false)
    },
    onErrorSync: () => {
      setIsWaitingSyncDone(false)
    },
  })
  useToastError(error, 'Failed to check balance')

  const [isOpenEvmConnect, setIsOpenEvmConnect] = useState(false)

  const externalToken = contentContainer.externalToken

  return (
    <>
      <BottomDrawer
        {...props}
        isOpen={props.isOpen && !isOpenSuccessModal}
        title={hasToLinkWallet ? 'Account not yet linked' : '🔒 Hold On'}
        description={
          hasToLinkWallet
            ? `To gain access to posting in this channel, you first need to connect your ${hasToLinkWallet} account.`
            : `You need at least ${formatNumber(
                amountRequired
              )} ${requiredToken} to unlock posting access in this channel.`
        }
      >
        {hasToLinkWallet ? (
          <div className='flex flex-col items-center gap-6'>
            <Image src={Confused} alt='' className='h-28 w-28' />
            {hasToLinkWallet === 'Ethereum' ? (
              <Button
                className='w-full'
                size='lg'
                onClick={() => {
                  sendEvent('token_gated_connect_evm')
                  openEvmLinkModal()
                  props.closeModal()
                }}
              >
                Connect Ethereum
              </Button>
            ) : (
              <SolanaButton
                className='w-full'
                size='lg'
                onClick={() => {
                  sendEvent('token_gated_connect_solana')
                  props.closeModal()
                }}
              >
                Connect Solana
              </SolanaButton>
            )}
          </div>
        ) : (
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3'>
              <Card className='flex flex-col gap-2 p-4'>
                <span className='text-3xl font-bold'>
                  {formatNumber(amountRequired)} {requiredToken}
                </span>
                <span className='text-sm text-text-muted'>
                  Required tokens amount
                </span>
              </Card>
              {currentToken && (
                <Card className='flex flex-col gap-2 p-4'>
                  <span className='text-3xl font-bold'>
                    {formatNumber(currentToken.parsedAmount)} {requiredToken}
                  </span>
                  <span className='text-sm text-text-muted'>
                    Your balance (
                    {truncateAddress(currentToken.blockchainAddress)})
                  </span>
                </Card>
              )}
            </div>
            {isAfterSync && !passRequirement && (
              <Notice noticeType='warning'>
                You need {formatNumber(remainingNeeded)} more {requiredToken} to
                gain access to this channel
              </Notice>
            )}
            <div className='flex flex-col gap-4'>
              <Button
                size='lg'
                isLoading={isWaitingSyncDone || isLoading}
                onClick={() => {
                  if (!externalToken) return
                  sendEvent('token_gated_check_balance')
                  syncExternalTokenBalances({
                    externalTokenId: externalToken.id,
                  })
                }}
              >
                Check my balance
              </Button>
              {externalToken && (
                <BuyTokenButton
                  address={externalToken.address}
                  chain={externalToken.chain}
                  size='lg'
                  variant='primaryOutline'
                >
                  Buy {currentToken ? 'more ' : ''}
                  {requiredToken}
                </BuyTokenButton>
              )}
            </div>
          </div>
        )}
      </BottomDrawer>
      <EvmConnectWalletModal
        isOpen={isOpenEvmConnect}
        closeModal={() => setIsOpenEvmConnect(false)}
      />
      <Modal
        title="You're now a member of the channel!"
        description='Follow the channel rules and participate in various activities to earn rewards.'
        isOpen={isOpenSuccessModal}
        closeModal={() => {
          setIsOpenSuccessModal(false)
          props.closeModal()
        }}
      >
        <div className='gap flex flex-col items-center gap-6'>
          <Image src={SuccessEmoji} alt='' className='h-28 w-28' />
          <Button
            className='w-full'
            size='lg'
            onClick={() => {
              setIsOpenSuccessModal(false)
              props.closeModal()
            }}
          >
            Got it!
          </Button>
        </div>
      </Modal>
    </>
  )
}

const linkGenerator: Record<ExternalTokenChain, (address: string) => string> = {
  ETHEREUM: (address) =>
    `https://app.uniswap.org/swap?chain=mainnet&outputCurrency=${address}`,
  SOLANA: (address) => `https://raydium.io/swap/?outputMint=${address}`,
}
function BuyTokenButton({
  address,
  chain,
  ...props
}: {
  address: string
  chain: ExternalTokenChain
} & ButtonProps) {
  return (
    <Button
      {...props}
      href={linkGenerator[chain]?.(address)}
      target='_blank'
      rel='noopener noreferrer'
    />
  )
}
