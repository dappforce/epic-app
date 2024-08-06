import Button from '@/components/Button'
import { useModerationActions } from '@/services/datahub/moderation/mutation'
import { getModerationReasonsQuery } from '@/services/datahub/moderation/query'
import { useApproveMessage } from '@/services/datahub/posts/mutation'

type ModerationButtonsProps = {
  chatId: string
  selectedMessageIds: string[]
  onSuccess: () => void
}

const ModerationButtons = ({
  chatId,
  selectedMessageIds,
  onSuccess,
}: ModerationButtonsProps) => {
  return (
    <>
      <BlockMessageButton
        chatId={chatId}
        selectedMessageIds={selectedMessageIds}
        onSuccess={onSuccess}
      />
      <ApproveMessagesButton
        selectedMessageIds={selectedMessageIds}
        onSuccess={onSuccess}
      />
    </>
  )
}

const BlockMessageButton = ({
  chatId,
  selectedMessageIds,
  onSuccess,
}: ModerationButtonsProps) => {
  const { mutateAsync: moderateMessage, isLoading } = useModerationActions()
  const { data: reasons } = getModerationReasonsQuery.useQuery(null)
  const firstReasonId = reasons?.[0].id

  const blockMessage = async () => {
    const moderatePromise = selectedMessageIds.map(async (messageId) => {
      await moderateMessage({
        callName: 'synth_moderation_block_resource',
        args: {
          reasonId: firstReasonId,
          resourceId: messageId,
          ctxPostIds: ['*'],
          ctxAppIds: ['*'],
        },
        chatId,
      })
    })

    await Promise.all(moderatePromise)

    onSuccess()
  }
  return (
    <Button variant='redOutline' onClick={blockMessage} isLoading={isLoading}>
      Block
    </Button>
  )
}

const ApproveMessagesButton = ({
  selectedMessageIds,
  onSuccess,
}: Omit<ModerationButtonsProps, 'chatId'>) => {
  const { mutate, isLoading } = useApproveMessage()

  const approveMessages = async () => {
    const approvePromise = selectedMessageIds.map(async (messageId) => {
      await mutate({
        approvedInRootPost: true,
        postId: messageId,
      })
    })

    await Promise.all(approvePromise)

    onSuccess()
  }
  return (
    <Button
      variant='greenOutline'
      onClick={approveMessages}
      isLoading={isLoading}
    >
      Approve
    </Button>
  )
}

export default ModerationButtons
