import BottomDrawer from '@/components/BottomDrawer'
import ChatForm, { ChatFormProps } from '@/components/chats/ChatForm'
import { ModalProps } from '@/components/modals/Modal'
import { sendEventWithRef } from '@/components/referral/analytics'
import { SendMessageParams } from '@/services/subsocial/commentIds/types'
import { useSendEvent } from '@/stores/analytics'
import { useMessageData } from '@/stores/message'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { PostContentExtension } from '@subsocial/api/types'
import { useEffect } from 'react'

export type BeforeMessageResult = {
  newMessageParams?: SendMessageParams
  txPrevented: boolean
}

export type CommonExtensionModalProps = ModalProps &
  Pick<
    ChatFormProps,
    | 'buildAdditionalTxParams'
    | 'chatId'
    | 'hubId'
    | 'sendButtonText'
    | 'autofocus'
    | 'onSubmit'
    | 'mustHaveMessageBody'
  > & {
    extensionType: PostContentExtension['id']
    disableSendButton?: boolean
    showChatForm?: boolean
    withDivider?: boolean
    beforeMesageSend?: (
      messageParams: SendMessageParams
    ) => Promise<BeforeMessageResult>
  }

export default function CommonExtensionModal({
  chatId,
  hubId,
  sendButtonText,
  disableSendButton,
  mustHaveMessageBody = false,
  autofocus,
  extensionType,
  showChatForm = true,
  withDivider = true,
  buildAdditionalTxParams,
  beforeMesageSend,
  onSubmit,
  ...props
}: CommonExtensionModalProps) {
  const sendEvent = useSendEvent()
  const myAddress = useMyMainAddress() ?? ''
  const setShowEmptyPrimaryChatInput = useMessageData(
    (state) => state.setShowEmptyPrimaryChatInput
  )
  useEffect(() => {
    setShowEmptyPrimaryChatInput(props.isOpen)
  }, [props.isOpen, setShowEmptyPrimaryChatInput])

  const isUsingBigButton = !!sendButtonText

  return (
    <BottomDrawer {...props}>
      <div
        className={cx({
          ['border-b border-border-gray pb-6']: withDivider,
        })}
      >
        {props.children}
      </div>
      {showChatForm && (
        <ChatForm
          autofocus={!!autofocus}
          chatId={chatId}
          hubId={hubId}
          mustHaveMessageBody={mustHaveMessageBody}
          beforeMesageSend={beforeMesageSend}
          sendButtonText={sendButtonText}
          placeholder='Optional message...'
          className='pb-1 pt-0.5'
          inputProps={{
            className: cx(
              'rounded-none bg-transparent py-4 pl-2 pr-20 !ring-0',
              !isUsingBigButton && 'rounded-b-2xl'
            ),
          }}
          sendButtonProps={{
            disabled: disableSendButton,
          }}
          buildAdditionalTxParams={buildAdditionalTxParams}
          onSubmit={() => {
            sendEventWithRef(myAddress, (refId) => {
              sendEvent(
                'send_comment',
                {
                  eventSource: 'extension-modal',
                  extensionType: extensionType,
                },
                { ref: refId }
              )
            })
            onSubmit?.()
            props.closeModal()
          }}
        />
      )}
    </BottomDrawer>
  )
}
