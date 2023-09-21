import Container from '@/components/Container'
import MessageModal from '@/components/modals/MessageModal'
import useLastReadMessageIdFromStorage from '@/hooks/useLastReadMessageId'
import usePrevious from '@/hooks/usePrevious'
import useWrapInRef from '@/hooks/useWrapInRef'
import { isOptimisticId } from '@/services/subsocial/utils'
import { useMessageData } from '@/stores/message'
import { cx } from '@/utils/class-names'
import { getChatPageLink, getUrlQuery } from '@/utils/links'
import { validateNumber } from '@/utils/strings'
import { replaceUrl, sendMessageToParentWindow } from '@/utils/window'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import urlJoin from 'url-join'
import { ChatListProps } from './ChatList'
import useFocusedLastMessageId from './hooks/useFocusedLastMessageId'
import useIsAtBottom from './hooks/useIsAtBottom'
import { ScrollToMessage } from './hooks/useScrollToMessage'
import { NewMessageNotice } from './NewMessageNotice'

export type ChatListSupportingContentProps = Pick<
  ChatListProps,
  'hubId' | 'chatId' | 'asContainer' | 'newMessageNoticeClassName'
> & {
  scrollToMessage: ScrollToMessage
  renderedMessageLength: number
  rawMessageIds: string[] | undefined | null
  filteredMessageIds: string[]
  scrollContainerRef: React.RefObject<HTMLDivElement>
}
export default function ChatListSupportingContent({
  hubId,
  chatId,
  scrollToMessage,
  asContainer,
  newMessageNoticeClassName,
  scrollContainerRef,
  renderedMessageLength,
  rawMessageIds,
  filteredMessageIds,
}: ChatListSupportingContentProps) {
  const router = useRouter()
  const isInitialized = useRef(false)

  const unreadMessage = useMessageData((state) => state.unreadMessage)
  const setUnreadMessage = useMessageData((state) => state.setUnreadMessage)
  const { setLastReadMessageId } = useLastReadMessageIdFromStorage(chatId)

  const lastReadId = useFocusedLastMessageId(chatId)
  const [recipient, setRecipient] = useState('')
  const [messageModalMsgId, setMessageModalMsgId] = useState('')
  const prevMessageModalMsgId = usePrevious(messageModalMsgId)

  const Component = asContainer ? Container<'div'> : 'div'

  // TODO: refactor this by putting the url query getter logic to ChatPage
  const hasScrolledToMessageRef = useRef(false)
  const filteredMessageIdsRef = useWrapInRef(filteredMessageIds)
  useEffect(() => {
    if (hasScrolledToMessageRef.current) return
    hasScrolledToMessageRef.current = true

    const messageId = getUrlQuery('messageId')
    const recipient = getUrlQuery('targetAcc')
    const isMessageIdsFetched = rawMessageIds !== undefined

    if (!isMessageIdsFetched) return

    if (!messageId || !validateNumber(messageId)) {
      if (lastReadId) {
        scrollToMessage(lastReadId ?? '', {
          shouldHighlight: false,
          smooth: false,
        }).then(() => {
          isInitialized.current = true

          const lastReadIdIndex = filteredMessageIdsRef.current.findIndex(
            (id) => id === lastReadId
          )
          const newMessageCount =
            lastReadIdIndex === -1
              ? 0
              : filteredMessageIdsRef.current.length - lastReadIdIndex - 1

          sendMessageToParentWindow('unread', newMessageCount.toString())
          setUnreadMessage({ count: newMessageCount, lastId: lastReadId })
        })
      } else {
        isInitialized.current = true
      }
      return
    }

    isInitialized.current = true
    setMessageModalMsgId(messageId)
    setRecipient(recipient)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMessageIds, filteredMessageIdsRef, hasScrolledToMessageRef])

  useEffect(() => {
    if (!isInitialized.current) return

    let lastId = ''
    if (unreadMessage.count === 0) {
      lastId = rawMessageIds?.[rawMessageIds.length - 1] ?? ''
      if (!lastId) return
    } else {
      lastId = unreadMessage.lastId
    }

    if (isOptimisticId(lastId)) return
    setLastReadMessageId(lastId)
  }, [setLastReadMessageId, rawMessageIds, unreadMessage])

  useEffect(() => {
    if (messageModalMsgId) {
      replaceUrl(urlJoin(getChatPageLink(router), `/${messageModalMsgId}`))
    } else if (prevMessageModalMsgId && !messageModalMsgId) {
      replaceUrl(getChatPageLink(router))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevMessageModalMsgId, messageModalMsgId])

  return (
    <>
      <MessageModal
        hubId={hubId}
        isOpen={!!messageModalMsgId}
        closeModal={() => setMessageModalMsgId('')}
        messageId={messageModalMsgId}
        scrollToMessage={scrollToMessage}
        recipient={recipient}
      />
      <Component>
        <div className='relative'>
          <NewMessageNotice
            className={cx(
              'absolute bottom-2 right-3',
              newMessageNoticeClassName
            )}
            messageIds={rawMessageIds ?? []}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </Component>
      <ScrollToBottom
        renderedMessageLength={renderedMessageLength}
        scrollContainerRef={scrollContainerRef}
      />
    </>
  )
}

function ScrollToBottom({
  scrollContainerRef,
  renderedMessageLength,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement>
  renderedMessageLength: number
}) {
  const isAtBottom = useIsAtBottom(scrollContainerRef, 100)
  const replyTo = useMessageData((state) => state.replyTo)

  const isAtBottomRef = useWrapInRef(isAtBottom)
  useEffect(() => {
    if (!isAtBottomRef.current) return
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current?.scrollHeight,
      behavior: 'auto',
    })
  }, [renderedMessageLength, isAtBottomRef, scrollContainerRef, replyTo])

  return null
}
