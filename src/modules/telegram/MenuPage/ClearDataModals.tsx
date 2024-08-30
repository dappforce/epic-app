import Button from '@/components/Button'
import Modal from '@/components/modals/Modal'
import { useRemoveMyLinkedIdentity } from '@/services/api/mutation'
import { useMyAccount } from '@/stores/my-account'
import { useEffect, useState } from 'react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
}

const TIMER_DURATION = 5

export const DeleteAccountConfirmationModal = ({
  isOpen,
  onClose,
}: ModalProps) => {
  const [isDisabled, setIsDisabled] = useState(true)
  const [timeLeft, setTimeLeft] = useState(5)

  const { mutate } = useRemoveMyLinkedIdentity({
    onSuccess: () => {
      useMyAccount.getState().logout()
      window.location.reload()
      onClose()
    },
  })

  useEffect(() => {
    if (timeLeft === 0) {
      setIsDisabled(false)
    }

    if (timeLeft === 0 || !isOpen) return

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeLeft, isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(TIMER_DURATION)
      setIsDisabled(true)
    }
  }, [isOpen])

  return (
    <Modal
      title={'Are you sure you want to delete your account?'}
      titleClassName='font-medium text-[22px]'
      isOpen={isOpen}
      closeModal={onClose}
    >
      <div className='flex w-full flex-col items-center gap-8'>
        <div className='flex flex-col items-center gap-1'>
          <span className='text-[68px]'>⚠️</span>
          <span className='text-center text-yellow-300'>
            Deleting your account will result in the loss of all points and
            access to your created posts, profile, and completed tasks.
          </span>
        </div>
        <div className='flex w-full items-center gap-4'>
          <Button
            variant='primaryOutline'
            size={'lg'}
            className='w-full px-0'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant='redOutline'
            size={'lg'}
            disabled={isDisabled}
            className='w-full px-0'
            onClick={() => {
              mutate(null)
            }}
          >
            {isDisabled ? `⏳ ${timeLeft} seconds` : 'Yes, Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export const CrearLocalData = ({ isOpen, onClose }: ModalProps) => {
  return (
    <Modal
      title={'Are you sure you want to clear data?'}
      titleClassName='font-medium text-[22px]'
      isOpen={isOpen}
      closeModal={onClose}
    >
      <div className='flex w-full flex-col items-center gap-8'>
        <div className='flex flex-col items-center gap-1'>
          <span className='text-[68px]'>⚠️</span>
          <span className='text-center text-yellow-300'>
            This action cannot be undone.
          </span>
        </div>
        <div className='flex w-full items-center gap-4'>
          <Button
            variant='primaryOutline'
            size={'lg'}
            className='w-full px-0'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant='redOutline'
            size={'lg'}
            className='w-full px-0'
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
          >
            Yes, Clear
          </Button>
        </div>
      </div>
    </Modal>
  )
}
