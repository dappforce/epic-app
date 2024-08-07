import PopOver from '@/components/floating/PopOver'
import { getLinkedIdentityQuery } from '@/services/datahub/identity/query'
import { useMyAccount, useMyGrillAddress } from '@/stores/my-account'

export type UnlinkAddressWrapperProps = {
  children: (canUnlinkAddress: boolean) => JSX.Element
}

export default function UnlinkAddressWrapper({
  children,
}: UnlinkAddressWrapperProps) {
  const canUnlinkAddress = useCanUnlinkAddress()

  return !canUnlinkAddress ? (
    <PopOver
      yOffset={8}
      trigger={<div className='w-full'>{children(canUnlinkAddress)}</div>}
      triggerOnHover
    >
      <p>
        You always need to have at least one account linked, please link another
        account first
      </p>
    </PopOver>
  ) : (
    children(canUnlinkAddress)
  )
}

function useCanUnlinkAddress() {
  const grillAddress = useMyGrillAddress()

  const hasProxy = useMyAccount((state) => !!state.parentProxyAddress)

  const { data: linkedIdentity } = getLinkedIdentityQuery.useQuery(
    grillAddress ?? ''
  )
  const hasLinkedIdentity = !!linkedIdentity

  const identityLinkedCount = [hasProxy, hasLinkedIdentity].filter(
    Boolean
  ).length

  return identityLinkedCount > 1
}
