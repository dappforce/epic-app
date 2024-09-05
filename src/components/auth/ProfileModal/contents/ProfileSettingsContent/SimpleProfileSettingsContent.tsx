import UpsertProfileForm from '@/components/profile/UpsertProfileForm'
import { useProfileModal } from '@/stores/profile-modal'
import { useEffect } from 'react'
import { ProfileModalContentProps } from '../../types'

export default function SimpleProfileSettingsContent({
  setCurrentState,
}: ProfileModalContentProps) {
  const clearInternalProps = useProfileModal(
    (state) => state.clearInternalProps
  )
  useEffect(() => {
    return () => {
      clearInternalProps()
    }
  }, [clearInternalProps])

  return (
    <div className='flex flex-col'>
      <UpsertProfileForm onSuccess={() => setCurrentState('account')} />
    </div>
  )
}
