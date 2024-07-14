import useIsMessageBlocked from '@/hooks/useIsMessageBlocked'
import usePrevious from '@/hooks/usePrevious'
import { getPostQuery } from '@/services/api/query'
import { useMessageData } from '@/stores/message'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { useQueryClient } from '@tanstack/react-query'
import { ComponentProps, forwardRef, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import ChatItem, { ChatItemProps } from '../ChatItem'

export type ChatItemContainerProps = Omit<ChatItemProps, 'isMyMessage'> & {
  containerProps?: ComponentProps<'div'>
  enableProfileModal?: boolean
  showBlockedMessage?: boolean
  chatId: string
  disableSuperLike?: boolean
  hubId: string
  showApproveButton?: boolean
}

function ChatItemContainer(
  {
    containerProps,
    chatId,
    hubId,
    showBlockedMessage,
    enableProfileModal = true,
    disableSuperLike,
    showApproveButton,
    ...props
  }: ChatItemContainerProps,
  ref: any
) {
  const { message } = props
  const isMessageBlockedInCurrentHub = useIsMessageBlocked(
    hubId,
    message,
    chatId
  )
  const isMessageBlockedInOriginalHub = useIsMessageBlocked(
    message.struct.spaceId ?? '',
    message,
    chatId
  )
  const isMessageBlocked =
    isMessageBlockedInCurrentHub || isMessageBlockedInOriginalHub

  const { content } = message
  const { body, extensions } = content || {}
  const myAddress = useMyMainAddress()

  if ((isMessageBlocked && !showBlockedMessage) || (!body && !extensions))
    return null

  const ownerId = message.struct.ownerId
  const senderAddress = ownerId ?? ''

  const isMyMessage = myAddress === senderAddress

  return (
    <div
      {...containerProps}
      ref={ref}
      // to prevent chat item from disappearing in IOS
      // ref: https://stackoverflow.com/a/54582980
      style={{ transform: 'translate3d(0, 0, 0)' }}
      className={cx(
        'w-11/12 @3xl:w-8/12',
        isMyMessage && 'self-end',
        containerProps?.className
      )}
    >
      <UnreadMessageChecker messageId={message.id} />
      <ChatItem
        {...props}
        chatId={chatId}
        isMyMessage={isMyMessage}
        enableProfileModal={enableProfileModal}
        disableSuperLike={disableSuperLike}
        hubId={hubId}
        showApproveButton={showApproveButton}
      />
    </div>
  )
}

function UnreadMessageChecker({ messageId }: { messageId: string }) {
  const client = useQueryClient()
  const { ref, inView } = useInView({
    onChange: (inView) => {
      if (inView) handleInView()
    },
  })

  const unreadMessage = useMessageData((state) => state.unreadMessage)
  const setUnreadMessage = useMessageData((state) => state.setUnreadMessage)
  const prevCount = usePrevious(unreadMessage.count)

  const handleInView = (isAfterScroll?: boolean) => {
    if (!unreadMessage.count) return
    const messageTime =
      getPostQuery.getQueryData(client, messageId)?.struct.createdAtTime ??
      Date.now()
    const lastTime = unreadMessage.lastMessageTime
    if (isAfterScroll || messageTime > lastTime) {
      setUnreadMessage((prev) => ({
        count: prev.count - 1,
        lastMessageTime: messageTime,
      }))
    }
  }

  const isPrevCountZero = prevCount === 0
  useEffect(() => {
    if (inView && isPrevCountZero) {
      handleInView(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, isPrevCountZero, unreadMessage.count, messageId])

  return (
    <div
      ref={ref}
      onChange={(inView) => {
        if (inView) handleInView()
      }}
    />
  )
}

export default forwardRef(ChatItemContainer)
