import Container from '@/components/Container'
import ExtensionModals from '@/components/extensions'
import TextArea from '@/components/inputs/TextArea'
import { getPostQuery } from '@/services/api/query'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import { useMessageData } from '@/stores/message'
import { cx } from '@/utils/class-names'
import dynamic from 'next/dynamic'
import { ComponentProps, ReactNode, RefObject, useEffect, useRef } from 'react'
import ChatInputBar from './ChatInputBar'

const ChatList = dynamic(() => import('../ChatList/ChatList'), {
  ssr: false,
})
// const ActionDetailBar = dynamic(() => import('./ActionDetailBar'), {
//   ssr: false,
// })

export type ChatRoomProps = ComponentProps<'div'> & {
  asContainer?: boolean
  scrollableContainerClassName?: string
  customAction?: ReactNode
  disableSuperLike?: boolean
  chatId: string
  hubId: string
  topElement?: ReactNode
  onlyDisplayUnapprovedMessages?: boolean
  contentContainer: ContentContainer
}

export default function ChatRoom({
  className,
  asContainer,
  scrollableContainerClassName,
  customAction,
  chatId,
  disableSuperLike,
  hubId,
  topElement,
  onlyDisplayUnapprovedMessages,
  contentContainer,
  ...props
}: ChatRoomProps) {
  const replyTo = useMessageData((state) => state.replyTo)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div {...props} className={cx('relative flex flex-1 flex-col', className)}>
      {topElement}
      <ChatList
        onlyDisplayUnapprovedMessages={onlyDisplayUnapprovedMessages}
        topElement={topElement}
        hubId={hubId}
        disableSuperLike={disableSuperLike}
        newMessageNoticeClassName={cx(replyTo && 'bottom-2')}
        chatId={chatId}
        asContainer={asContainer}
        scrollableContainerClassName={scrollableContainerClassName}
        scrollContainerRef={scrollContainerRef}
      />
      <ChatInputWrapper
        contentContainer={contentContainer}
        customAction={customAction}
        chatId={chatId}
        hubId={hubId}
        asContainer={asContainer}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  )
}

type ChatInputWrapperProps = Pick<
  ChatRoomProps,
  'asContainer' | 'chatId' | 'hubId' | 'customAction' | 'contentContainer'
> & {
  scrollContainerRef: RefObject<HTMLDivElement>
}
function ChatInputWrapper({
  asContainer,
  chatId,
  hubId,
  customAction,
  scrollContainerRef,
  contentContainer,
}: ChatInputWrapperProps) {
  const clearAction = useMessageData((state) => state.clearAction)

  useEffect(() => {
    return () => clearAction()
  }, [clearAction])

  const Component = asContainer ? Container<'div'> : 'div'

  const scrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer?.scrollTo({
        top: scrollContainer?.scrollHeight,
        behavior: 'auto',
      })
    }
  }

  const { data: chat } = getPostQuery.useQuery(chatId, {
    showHiddenPost: { type: 'all' },
  })
  const isHidden = chat?.struct.hidden

  return (
    <>
      <Component className={cx('mt-auto flex py-0 pt-2')}>
        <div className='flex flex-1 flex-col'>
          {/* <ActionDetailBar
            chatId={chatId}
            hubId={hubId}
            scrollContainer={scrollContainerRef}
          /> */}
          {(() => {
            if (customAction) return customAction

            if (isHidden)
              return (
                <TextArea
                  rows={1}
                  disabled
                  value='You cannot send messages in a hidden chat'
                  className='bg-background-light/50 text-center text-text-muted !brightness-100'
                  variant='fill'
                  pill
                />
              )

            return (
              <ChatInputBar
                formProps={{
                  hubId,
                  chatId,
                  onSubmit: (isEditing) => {
                    if (!isEditing) scrollToBottom()
                  },
                  isPrimary: true,
                }}
              />
            )
          })()}
        </div>
      </Component>

      <ExtensionModals
        hubId={hubId}
        chatId={chatId}
        onSubmit={scrollToBottom}
        containerContainer={contentContainer}
      />
    </>
  )
}
