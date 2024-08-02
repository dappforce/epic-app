import Button from '@/components/Button'
import { useModerationActions } from '@/services/datahub/moderation/mutation'
import { getModerationReasonsQuery } from '@/services/datahub/moderation/query'
import { useApproveMessage } from '@/services/datahub/posts/mutation'

type ModerationButtonsProps = {
  chatId: string
  selectedMessageIds: string[]
}

const ModerationButtons = ({
  chatId,
  selectedMessageIds,
}: ModerationButtonsProps) => {
  return (
    <>
      <BlockMessagessButton
        chatId={chatId}
        selectedMessageIds={selectedMessageIds}
      />
      <ApproveMessagesButton selectedMessageIds={selectedMessageIds} />
    </>
  )
}

type BlockMessagessButtonProps = {
  chatId: string
  selectedMessageIds: string[]
}

const BlockMessagessButton = ({
  chatId,
  selectedMessageIds,
}: BlockMessagessButtonProps) => {
  const { mutate: moderateMessage, isLoading } = useModerationActions()
  const { data: reasons } = getModerationReasonsQuery.useQuery(null)
  const firstReasonId = reasons?.[0].id

  const blockMessage = () => {
    selectedMessageIds.forEach((messageId) => {
      moderateMessage({
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
  }
  return (
    <Button variant='redOutline' onClick={blockMessage} isLoading={isLoading}>
      Block
    </Button>
  )
}

const ApproveMessagesButton = ({
  selectedMessageIds,
}: Omit<BlockMessagessButtonProps, 'chatId'>) => {
  const { mutate, isLoading } = useApproveMessage()

  const approveMessages = () => {
    selectedMessageIds.forEach((messageId) => {
      mutate({
        approvedInRootPost: true,
        postId: messageId,
      })
    })
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
