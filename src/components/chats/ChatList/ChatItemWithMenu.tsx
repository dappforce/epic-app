import { FloatingWrapperProps } from '@/components/floating/FloatingWrapper'
import useLongTouch from '@/hooks/useLongTouch'
import { isTouchDevice } from '@/utils/device'
import { PostData } from '@subsocial/api/types'
import { ComponentProps, memo } from 'react'
import ChatItemMenus from '../ChatItem/ChatItemMenus'
import { getMessageElementId } from '../utils'
import ChatItemContainer from './ChatItemContainer'
import { ScrollToMessage } from './hooks/useScrollToMessage'

const MemoizedChatItemContainer = memo(ChatItemContainer)

export type ChatItemWithMenuProps = {
  chatItemClassName?: string
  message: PostData | null | undefined
  chatId: string
  hubId: string
  noBorder?: boolean
  enableProfileModal?: boolean
  withWrapper?: boolean
  showBlockedMessage?: boolean
  disableSuperLike?: boolean
  scrollToMessage?: ScrollToMessage
  showBlockButton?: boolean
  showApproveButton?: boolean
  menuIdPrefix?: string
  containerProps?: ComponentProps<'div'>
}
function InnerChatItemWithMenu({
  message,
  chatItemClassName,
  chatId,
  hubId,
  noBorder,
  enableProfileModal = true,
  showBlockedMessage,
  disableSuperLike,
  showBlockButton,
  withWrapper,
  scrollToMessage,
  showApproveButton,
  containerProps,
  menuIdPrefix,
}: ChatItemWithMenuProps) {
  return message ? (
    <ChatItemMenus
      chatId={chatId}
      messageId={message.id}
      key={message.id}
      hubId={hubId}
      menuIdPrefix={menuIdPrefix}
    >
      {(config) => (
        <ChatItemMenuWrapper config={config}>
          <MemoizedChatItemContainer
            className={chatItemClassName}
            enableChatMenu={false}
            hubId={hubId}
            chatId={chatId}
            noBorder={noBorder}
            message={message}
            showBlockedMessage={showBlockedMessage}
            withWrapper={withWrapper}
            messageBubbleId={getMessageElementId(message.id)}
            disableSuperLike={disableSuperLike}
            enableProfileModal={enableProfileModal}
            scrollToMessage={scrollToMessage}
            showApproveButton={showApproveButton}
            showBlockButton={showBlockButton}
            menuIdPrefix={menuIdPrefix}
            containerProps={containerProps}
          />
        </ChatItemMenuWrapper>
      )}
    </ChatItemMenus>
  ) : null
}

type ChatItemMenuWrapperProps = {
  config?: Parameters<FloatingWrapperProps['children']>[0]
  children: React.ReactNode
}

const ChatItemMenuWrapper = ({
  config,
  children,
}: ChatItemMenuWrapperProps) => {
  const { toggleDisplay, referenceProps } = config || {}

  const onLongPress = useLongTouch(
    (e) => {
      if (isTouchDevice()) {
        toggleDisplay?.(e)
      }
    },
    { delay: 500 }
  )

  return (
    <div
      {...referenceProps}
      className='flex h-full select-none flex-col'
      {...onLongPress}
      onContextMenu={(e) => {
        if (!isTouchDevice()) {
          e.preventDefault()
          toggleDisplay?.(e)
        }
      }}
    >
      {children}
    </div>
  )
}
const ChatItemWithMenu = memo(InnerChatItemWithMenu)
export default ChatItemWithMenu
