import { getReferralIdInUrl } from '@/components/referral/ReferralUrlChanger'
import { getReferralLink } from '@/components/referral/utils'
import { useMiniAppRaw } from '@tma.js/sdk-react'
import { useEffect } from 'react'
import useIsMounted from './useIsMounted'

const useRedirectToTgBotOnDesktop = () => {
  const app = useMiniAppRaw(true)
  const isMounted = useIsMounted()

  const hasTelegramLoginInfo = app?.result
  useEffect(() => {
    if (!hasTelegramLoginInfo && isMounted) {
      window.location.href = getReferralLink(getReferralIdInUrl())
    }
  }, [hasTelegramLoginInfo, isMounted])
}

export default useRedirectToTgBotOnDesktop
