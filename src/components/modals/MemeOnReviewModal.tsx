import Check from '@/assets/emojis/check.png'
import Time from '@/assets/emojis/time.png'
import { MIN_MEME_FOR_REVIEW } from '@/constants/chat'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import { getUserPostedMemesForCountQuery } from '@/services/datahub/posts/query'
import { useMyMainAddress } from '@/stores/my-account'
import Image from 'next/image'
import Button from '../Button'
import Modal, { ModalFunctionalityProps } from './Modal'

export default function MemeOnReviewModal({
  chatId,
  contentContainer,
  ...props
}: ModalFunctionalityProps & {
  chatId: string
  contentContainer: ContentContainer
}) {
  const myAddress = useMyMainAddress() ?? ''
  const { data: postedMemes } = getUserPostedMemesForCountQuery.useQuery(
    { address: myAddress, chatId },
    {
      enabled: props.isOpen,
    }
  )
  const sentMeme = postedMemes?.length ?? 0
  const remaining = MIN_MEME_FOR_REVIEW - sentMeme

  const description =
    remaining > 0
      ? `${
          contentContainer.createCommentPricePointsAmount
        } points have been used. We received your meme! We need at least ${remaining} more meme${
          remaining > 1 ? 's' : ''
        } from you to mark you as a verified creator.`
      : `${
          contentContainer.createCommentPricePointsAmount
        } points have been used. We received ${
          sentMeme ?? 0
        } memes from you! Now we need a bit of time to finish review you as a verified creator.`

  return (
    <Modal {...props} title='Under Review' description={description}>
      <div className='flex flex-col items-center gap-6'>
        <Image
          src={remaining > 0 ? Time : Check}
          alt=''
          className='h-28 w-28'
        />
        <Button className='w-full' size='lg' onClick={() => props.closeModal()}>
          Got it!
        </Button>
      </div>
    </Modal>
  )
}
