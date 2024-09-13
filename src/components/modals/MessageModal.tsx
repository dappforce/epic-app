import { getPostQuery } from '@/services/api/query'
import { useSendEvent } from '@/stores/analytics'
import { useLoginModal } from '@/stores/login-modal'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { CommentData } from '@subsocial/api/types'
import { useEffect, useRef, useState } from 'react'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import Button from '../Button'
import Card from '../Card'
import ProfilePreview from '../ProfilePreview'
import { Skeleton } from '../SkeletonFallback'
import MemeChatItem from '../chats/ChatItem/MemeChatItem'
import { ScrollToMessage } from '../chats/ChatList/hooks/useScrollToMessage'
import PopOver from '../floating/PopOver'
import Modal, { ModalFunctionalityProps } from './Modal'

export type MessageModalProps = ModalFunctionalityProps & {
  messageId: string
  scrollToMessage?: ScrollToMessage
  hubId: string
  recipient?: string
  redirectTo?: string
}

export default function MessageModal({
  messageId,
  scrollToMessage,
  hubId,
  recipient,
  redirectTo,
  ...props
}: MessageModalProps) {
  const myAddress = useMyMainAddress()
  const isInitialized = useMyAccount((state) => state.isInitialized)
  const isDifferentRecipient = recipient !== myAddress

  const isOpenLoginModal = useLoginModal.use.isOpen()
  const setIsOpenLoginModal = useLoginModal.use.setIsOpen()

  const { data: message } = getPostQuery.useQuery(messageId)
  const chatId = (message as unknown as CommentData)?.struct.rootPostId
  const { data: chat } = getPostQuery.useQuery(chatId)

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const [isScrolling, setIsScrolling] = useState(false)

  const chatTitle = chat?.content?.title || (
    <span className='ml-2 inline-block h-[1.3em] w-28 animate-pulse rounded-lg bg-background' />
  )

  const sendEvent = useSendEvent()
  useEffect(() => {
    if (!isInitialized) return

    if (props.isOpen && recipient)
      sendEvent('open_tg_notification', {
        isMyNotif: (myAddress === recipient) + '',
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isOpen, isInitialized])

  const handleScrollToMessage = async () => {
    if (!scrollToMessage) return

    setIsScrolling(true)
    await scrollToMessage(messageId, { smooth: false })
    setIsScrolling(false)

    props.closeModal()
  }

  return (
    <Modal
      {...props}
      withCloseButton
      isOpen={props.isOpen && !isOpenLoginModal}
      initialFocus={buttonRef}
      title={<span className='flex items-center'>{chatTitle}</span>}
    >
      <div
        className={cx(
          'relative flex flex-col overflow-y-auto rounded-2xl pb-0',
          !message && 'h-28 animate-pulse'
        )}
      >
        {message ? (
          <div className='flex flex-col pb-2'>
            <MemeChatItem
              className='max-w-none rounded-2xl bg-background-lighter/50'
              noBorder
              enableChatMenu={false}
              message={message}
              chatId={chatId}
              hubId={hubId}
            />
          </div>
        ) : (
          <Skeleton className='h-96 w-full rounded-2xl' />
        )}
        {(scrollToMessage || redirectTo) && (
          <div className='sticky -bottom-px left-0 pt-4'>
            <Button
              ref={buttonRef}
              isLoading={isScrolling}
              onClick={() => props.closeModal()}
              // onClick={scrollToMessage ? handleScrollToMessage : undefined}
              // href={scrollToMessage ? undefined : redirectTo}
              target='_blank'
              size='lg'
              className='w-full'
            >
              Check Out More Memes!
              {/* {scrollToMessage ? (
                'Scroll to message'
              ) : (
                <span>
                  Go to message <HiArrowUpRight className='inline' />
                </span>
              )} */}
            </Button>
          </div>
        )}
      </div>
      {isDifferentRecipient && recipient && (
        <Card className='mt-4 bg-background-lighter'>
          <div className='flex items-center gap-2 text-text-muted'>
            <span className='text-sm'>Notification recipient</span>
            <PopOver
              trigger={<HiOutlineInformationCircle />}
              triggerOnHover
              panelSize='sm'
              yOffset={6}
              placement='top'
            >
              <p>You are not currently logged in to this account.</p>
            </PopOver>
          </div>
          <ProfilePreview
            className='mt-3 gap-3'
            address={recipient}
            addressesContainerClassName='gap-1'
            avatarClassName='h-9 w-9'
          />
          <Button
            size='lg'
            className='mt-4 w-full'
            onClick={() => setIsOpenLoginModal(true)}
          >
            Log In
          </Button>
        </Card>
      )}
    </Modal>
  )
}
