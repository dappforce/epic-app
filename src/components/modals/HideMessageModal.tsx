import useToastError from '@/hooks/useToastError'
import { getPostQuery } from '@/services/api/query'
import { useHideMessage } from '@/services/subsocial/posts/mutation'
import { cx } from '@/utils/class-names'
import { HiOutlineEyeSlash } from 'react-icons/hi2'
import { toast } from 'sonner'
import Toast from '../Toast'
import MemeChatItem from '../chats/ChatItem/MemeChatItem'
import ConfirmationModal from './ConfirmationModal'
import { ModalFunctionalityProps } from './Modal'

export type HideMessageModalProps = ModalFunctionalityProps & {
  messageId: string
  chatId: string
  hubId: string
}

export default function HideMessageModal({
  messageId,
  chatId,
  hubId,
  ...props
}: HideMessageModalProps) {
  const { data: message } = getPostQuery.useQuery(messageId)
  const { mutate: hideMessage, error } = useHideMessage()
  useToastError(error, 'Failed to hide message')

  if (!message) return null

  return (
    <ConfirmationModal
      {...props}
      title='🤔 Make this message hidden?'
      primaryButtonProps={{ children: 'No, keep it public' }}
      secondaryButtonProps={{
        children: 'Yes, hide this message',
        onClick: () => {
          hideMessage({ messageId })
          toast.custom((t) => (
            <Toast
              t={t}
              title='Message hidden'
              icon={(className) => (
                <HiOutlineEyeSlash className={cx(className, 'text-base')} />
              )}
            />
          ))
        },
      }}
      content={() => (
        <div
          className={cx(
            'relative flex max-h-96 flex-col overflow-y-auto rounded-2xl bg-background p-2 md:p-4'
          )}
        >
          <MemeChatItem
            enableChatMenu={false}
            message={message}
            hubId={hubId}
            chatId={chatId}
            className='max-w-none rounded-2xl bg-background-lighter'
            noBorder
          />
        </div>
      )}
    />
  )
}
