import AddressAvatar from '@/components/AddressAvatar'
import ProfilePreviewModalWrapper from '@/components/ProfilePreviewModalWrapper'
import { isMessageSent } from '@/services/subsocial/commentIds/optimistic'
import { useMessageData } from '@/stores/message'
import { cx } from '@/utils/class-names'
import { PostData } from '@subsocial/api/types'
import { ComponentProps } from 'react'
import { ScrollToMessage } from '../ChatList/hooks/useScrollToMessage'
import ChatItemMenus from './ChatItemMenus'
import ChatItemWithExtension from './ChatItemWithExtension'
import Embed, { useCanRenderEmbed } from './Embed'
import { getMessageStatusById } from './MessageStatusIndicator'
import DefaultChatItem from './variants/DefaultChatItem'
import EmojiChatItem, {
  shouldRenderEmojiChatItem,
} from './variants/EmojiChatItem'

export type ChatItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  message: PostData
  isMyMessage: boolean
  messageBubbleId?: string
  scrollToMessage?: ScrollToMessage
  enableChatMenu?: boolean
  chatId: string
  hubId: string
  bg?: 'background-light' | 'background'
  showApproveButton?: boolean
}

export default function ChatItem({
  message,
  isMyMessage,
  scrollToMessage,
  messageBubbleId,
  enableChatMenu = true,
  chatId,
  hubId,
  bg = 'background-light',
  showApproveButton,
  ...props
}: ChatItemProps) {
  const setReplyTo = useMessageData((state) => state.setReplyTo)

  const messageId = message.id
  const { ownerId, dataType } = message.struct
  const { body, extensions, link } = message.content || {}

  const setMessageAsReply = () => {
    if (!isMessageSent(messageId, dataType)) return
    setReplyTo(messageId)
  }

  const canRenderEmbed = useCanRenderEmbed(link ?? '')

  if (showApproveButton && message.struct.approvedInRootPost) return null
  if (!showApproveButton && !message.struct.approvedInRootPost) return null

  if (!body && (!extensions || extensions.length === 0)) return null

  const isEmojiOnly = shouldRenderEmojiChatItem(body ?? '')
  const ChatItemContentVariant = isEmojiOnly ? EmojiChatItem : DefaultChatItem

  const messageStatus = getMessageStatusById(message)

  return (
    <>
      <div
        {...props}
        className={cx(
          'relative flex items-start justify-start gap-2',
          isMyMessage && 'flex-row-reverse',
          props.className
        )}
      >
        {!isMyMessage && (
          <ProfilePreviewModalWrapper address={ownerId} messageId={message.id}>
            {(onClick) => (
              <AddressAvatar
                onClick={onClick}
                address={ownerId}
                className='flex-shrink-0 cursor-pointer'
              />
            )}
          </ProfilePreviewModalWrapper>
        )}
        <ChatItemMenus
          chatId={chatId}
          messageId={message.id}
          enableChatMenu={enableChatMenu}
          hubId={hubId}
        >
          {(config) => {
            const { toggleDisplay, referenceProps } = config || {}

            return (
              <div
                className={cx('relative flex flex-col')}
                onContextMenu={(e) => {
                  e.preventDefault()
                  toggleDisplay?.(e)
                }}
                // onDoubleClick={() => setMessageAsReply()}
                {...referenceProps}
                id={messageBubbleId}
              >
                {extensions && extensions.length > 0 ? (
                  <ChatItemWithExtension
                    scrollToMessage={scrollToMessage}
                    message={message}
                    isMyMessage={isMyMessage}
                    chatId={chatId}
                    hubId={hubId}
                    bg={bg}
                    showApproveButton={showApproveButton}
                  />
                ) : (
                  <ChatItemContentVariant
                    message={message}
                    isMyMessage={isMyMessage}
                    scrollToMessage={scrollToMessage}
                    chatId={chatId}
                    hubId={hubId}
                    bg={bg}
                  />
                )}
              </div>
            )
          }}
        </ChatItemMenus>
      </div>
      {canRenderEmbed && (
        <div className={cx(isMyMessage ? 'flex justify-end' : 'flex')}>
          {/* Offset for avatar */}
          {!isMyMessage && <div className='w-11 flex-shrink-0' />}
          <Embed
            className={cx('mt-1', isMyMessage ? 'flex justify-end' : 'flex')}
            link={link ?? ''}
          />
        </div>
      )}
    </>
  )
}
