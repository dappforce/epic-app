import { useAnalytics } from '@/stores/analytics'
import { useEffect } from 'react'
import { toast } from 'sonner'
import Button from '../Button'
import Toast from '../Toast'
import Modal, { ModalFunctionalityProps, ModalProps } from '../modals/Modal'
import UpsertProfileForm from './UpsertProfileForm'

export type SubsocialProfileModalProps = ModalFunctionalityProps &
  Pick<ModalProps, 'onBackClick' | 'title'> & {
    cancelButtonText?: string
  }

export default function UpsertProfileModal({
  title,
  cancelButtonText,
  ...props
}: SubsocialProfileModalProps) {
  const sendEvent = useAnalytics((state) => state.sendEvent)

  useEffect(() => {
    if (props.isOpen) {
      sendEvent('account_settings_opened')
    }
  }, [props.isOpen, sendEvent])

  const onSuccess = () => {
    props.closeModal()
    sendEvent('account_settings_changed', undefined, {
      hasPersonalizedProfile: true,
    })
    toast.custom((t) => <Toast t={t} title='Your nickname was set' />)
  }

  return (
    <Modal {...props} title={title || '✏️ Edit Profile'} withCloseButton>
      <UpsertProfileForm onSuccess={onSuccess} />
      {cancelButtonText && (
        <Button
          onClick={() => props.closeModal()}
          size='lg'
          variant='primaryOutline'
          className='mt-4'
        >
          {cancelButtonText}
        </Button>
      )}
    </Modal>
  )
}
