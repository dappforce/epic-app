import Button from '@/components/Button'
import Modal from '@/components/modals/Modal'
import { ResendFailedMessageWrapper } from '@/services/subsocial/commentIds/mutation'
import {
  isClientGeneratedOptimisticId,
  isMessageSent,
} from '@/services/subsocial/commentIds/optimistic'
import { useSendEvent } from '@/stores/analytics'
import { cx } from '@/utils/class-names'
import { PostData } from '@subsocial/api/types'
import { SyntheticEvent, useReducer, useState } from 'react'
import { BsExclamationLg } from 'react-icons/bs'
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from 'react-icons/io5'
import CheckMarkExplanationModal, {
  CheckMarkModalVariant,
} from './CheckMarkExplanationModal'

export type MessageStatus = 'sending' | 'offChain' | 'optimistic' | 'blockchain'

export type MessageStatusIndicatorProps = {
  message: PostData
}

type CheckMarkModalReducerState = {
  isOpen: boolean
  variant: CheckMarkModalVariant | ''
}
const checkMarkModalReducer = (
  state: CheckMarkModalReducerState,
  action: CheckMarkModalVariant | ''
): CheckMarkModalReducerState => {
  if (action === '') {
    return { ...state, isOpen: false }
  }
  return { isOpen: true, variant: action }
}

export default function MessageStatusIndicator({
  message,
}: MessageStatusIndicatorProps) {
  const sendEvent = useSendEvent()

  const messageStatus = getMessageStatusById(message)
  const [checkMarkModalState, dispatch] = useReducer(checkMarkModalReducer, {
    isOpen: false,
    variant: '',
  })

  if (message.struct.blockchainSyncFailed) {
    return <ResendMessageIndicator message={message} />
  }

  const onCheckMarkClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    const checkMarkType: CheckMarkModalVariant = checkMarkModalState
      ? 'recorded'
      : 'recording'
    sendEvent('click check_mark_button', { type: checkMarkType })
    dispatch(checkMarkType)
  }

  return (
    <Button
      variant='transparent'
      size='noPadding'
      interactive='brightness-only'
      onClick={onCheckMarkClick}
    >
      {(() => {
        if (messageStatus === 'sending') {
          return (
            <IoCheckmarkOutline
              className={cx(
                'text-sm text-text-muted dark:text-text-muted-on-primary'
              )}
            />
          )
        } else if (messageStatus === 'blockchain') {
          return (
            <IoCheckmarkDoneOutline className='text-sm text-blue-700 dark:text-blue-400' />
          )
        } else if (messageStatus === 'optimistic') {
          return (
            <IoCheckmarkDoneOutline className='text-sm dark:text-text-on-primary' />
          )
        } else if (messageStatus === 'offChain') {
          return (
            <IoCheckmarkDoneOutline className='text-sm text-red-600 dark:text-text-on-primary' />
          )
        }
      })()}

      <CheckMarkExplanationModal
        isOpen={checkMarkModalState.isOpen}
        variant={checkMarkModalState.variant || 'recording'}
        closeModal={() => dispatch('')}
        blockNumber={message.struct.createdAtBlock}
        cid={message.struct.contentId}
      />
    </Button>
  )
}

export function getMessageStatusById(message: PostData): MessageStatus {
  const id = message.id
  console.log(id, message.struct, message.content)
  if (!isMessageSent(id, message.struct.dataType)) {
    if (isClientGeneratedOptimisticId(id)) return 'sending'
    if (message.struct.dataType === 'offChain') return 'offChain'
    return 'optimistic'
  } else {
    return 'blockchain'
  }
}

function ResendMessageIndicator({ message }: MessageStatusIndicatorProps) {
  const [isResendOpen, setIsResendOpen] = useState(false)
  const sendEvent = useSendEvent()

  return (
    <>
      <Button
        className='flex items-center rounded-full bg-text-warning/40 text-text-warning'
        variant='transparent'
        size='noPadding'
        onClick={() => {
          sendEvent('click message_failed_status_button')
          setIsResendOpen(true)
        }}
      >
        <BsExclamationLg className={cx('block text-sm')} />
      </Button>
      <Modal
        isOpen={isResendOpen}
        closeModal={() => setIsResendOpen(false)}
        title='Message failed to be sent to blockchain'
        description="Don't worry, your message is still visible to everyone, but it's not censorship-resistant. You can try to resend it."
        withCloseButton
      >
        <ResendFailedMessageWrapper>
          {({ isLoading, mutateAsync }) => {
            return (
              <Button
                size='lg'
                isLoading={isLoading}
                onClick={async () => {
                  if (!message.content) return
                  sendEvent('click resend_message_button')
                  await mutateAsync({
                    chatId: message.struct.rootPostId,
                    content: message.content,
                  })
                  setIsResendOpen(false)
                }}
              >
                Resend Message
              </Button>
            )
          }}
        </ResendFailedMessageWrapper>
      </Modal>
    </>
  )
}
