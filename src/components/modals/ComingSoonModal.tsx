import Button from '../Button'
import Modal from './Modal'

type ComingSoonModalProps = {
  isOpen: boolean
  onClose: () => void
}

const ComingSoonModal = ({ isOpen, onClose }: ComingSoonModalProps) => {
  return (
    <Modal
      title={'Coming Soon!'}
      description={
        "We're still working on this feature. Stay tuned, and we'll let you know when it's ready!"
      }
      titleClassName='font-medium'
      isOpen={isOpen}
      closeModal={onClose}
    >
      <div className='flex w-full flex-col items-center gap-8'>
        <span className='text-[103px]'>🛠</span>
        <Button
          variant='primary'
          size={'lg'}
          className='w-full'
          onClick={onClose}
        >
          Got it!
        </Button>
      </div>
    </Modal>
  )
}

export default ComingSoonModal
