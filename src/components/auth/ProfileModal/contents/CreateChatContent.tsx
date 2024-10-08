import LoadingContent from '@/components/community/content/LoadingContent'
import UpsertChatForm from '@/components/community/content/UpsertChatForm'
import { getProfileQuery } from '@/services/datahub/profiles/query'
import { useMyMainAddress } from '@/stores/my-account'
import { ProfileModalContentProps } from '../types'

export const CreateChatContent = ({
  setCurrentState,
}: ProfileModalContentProps) => {
  const myAddress = useMyMainAddress() || ''

  const { data: profile } = getProfileQuery.useQuery(myAddress)

  const hubId = profile?.profileSpace?.id

  return (
    <UpsertChatForm
      hubId={hubId}
      customModalStates={{
        onLoading: () => setCurrentState('create-chat-loading'),
      }}
    />
  )
}

export const CreateChatLoadingContent = (_props: ProfileModalContentProps) => {
  return <LoadingContent />
}
