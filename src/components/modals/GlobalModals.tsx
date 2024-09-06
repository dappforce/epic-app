import { useMessageData } from '@/stores/message'
import BlockedModal from '../moderation/BlockedModal'
import MemeOnReviewModal from './MemeOnReviewModal'
import PostMemeThresholdModal from './PostMemeThresholdModal'

export default function GlobalModals() {
  const isOpenMessageModal = useMessageData.use.isOpenMessageModal()
  const currentData = useMessageData.use.currentData()
  const setOpenMessageModal = useMessageData.use.setOpenMessageModal()

  return (
    <>
      <PostMemeThresholdModal
        chatId={currentData.chatId}
        isOpen={isOpenMessageModal === 'not-enough-balance'}
        closeModal={() => setOpenMessageModal('')}
      />
      {currentData.contentContainer && (
        <MemeOnReviewModal
          chatId={currentData.chatId}
          contentContainer={currentData.contentContainer}
          isOpen={isOpenMessageModal === 'on-review'}
          closeModal={() => setOpenMessageModal('')}
        />
      )}
      <BlockedModal
        isOpen={isOpenMessageModal === 'blocked'}
        closeModal={() => setOpenMessageModal('')}
      />
    </>
  )
}
