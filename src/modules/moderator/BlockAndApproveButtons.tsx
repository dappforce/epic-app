import Button from '@/components/Button'
import { useModerationActions } from '@/services/datahub/moderation/mutation'
import { getModerationReasonsQuery } from '@/services/datahub/moderation/query'
import { useApproveMessage } from '@/services/datahub/posts/mutation'
import { useMyMainAddress } from '@/stores/my-account'

type BlockAndApproveButtonsProps = {
  chatId: string
  selectedMessageIds: string[]
  onSuccess: () => void
}

const BlockAndApproveButtons = ({
  chatId,
  selectedMessageIds,
  onSuccess,
}: BlockAndApproveButtonsProps) => {
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
}: BlockAndApproveButtonsProps) => {
  const { mutateAsync: moderateMessage, isLoading } = useModerationActions()
  const myAddress = useMyMainAddress()
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

    setTimeout(() => onSuccess(), 1000)
  }
  return (
    <Button
      variant='redOutline'
      disabled={!myAddress}
      onClick={blockMessage}
      isLoading={isLoading}
    >
      Block
    </Button>
  )
}

const ApproveMessagesButton = ({
  selectedMessageIds,
  onSuccess,
}: Omit<BlockAndApproveButtonsProps, 'chatId'>) => {
  const { mutateAsync, isLoading, isSuccess } = useApproveMessage()
  const myAddress = useMyMainAddress()

  const approveMessages = async () => {
    const approvePromise = selectedMessageIds.map(async (messageId) => {
      await mutateAsync({
        approvedInRootPost: true,
        postId: messageId,
      })
    })

    await Promise.all(approvePromise)

    setTimeout(() => onSuccess(), 1000)
  }
  return (
    <Button
      variant='greenOutline'
      onClick={approveMessages}
      disabled={!myAddress}
      isLoading={isLoading}
    >
      Approve
    </Button>
  )
}

export default BlockAndApproveButtons
