import { CopyText } from '@/components/CopyText'
import { useSendEvent } from '@/stores/analytics'
import { useMyAccount } from '@/stores/my-account'
import { decodeSecretKey, isSecretKeyUsingMiniSecret } from '@/utils/account'
import { useMemo } from 'react'

function PrivateKeyContent() {
  const encodedSecretKey = useMyAccount((state) => state.encodedSecretKey)
  const { secretKey, isUsingMiniSecret } = useMemo(() => {
    const decodedSecretKey = decodeSecretKey(encodedSecretKey ?? '')
    if (isSecretKeyUsingMiniSecret(decodedSecretKey)) {
      return { secretKey: `0x${decodedSecretKey}`, isUsingMiniSecret: true }
    }

    return {
      secretKey: decodedSecretKey,
      isUsingMiniSecret: false,
    }
  }, [encodedSecretKey])

  const sendEvent = useSendEvent()
  const onCopyClick = () => {
    sendEvent('copy_private_key')
  }

  return (
    <div className='flex flex-col items-center gap-4'>
      <p className='text-text-muted'>
        Grill key is like a long password. We recommend keeping it in a safe
        place, so you can recover your account.
      </p>
      <CopyText
        onCopyClick={onCopyClick}
        isCodeText
        wordBreakType={isUsingMiniSecret ? 'all' : 'words'}
        text={secretKey || ''}
      />
    </div>
  )
}

export default PrivateKeyContent
