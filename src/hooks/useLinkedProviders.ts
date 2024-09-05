import {
  getLinkedIdentityFromMainAddressQuery,
  getLinkedIdentityQuery,
} from '@/services/datahub/identity/query'
import { useMyGrillAddress } from '@/stores/my-account'
import { IdentityProvider } from '@subsocial/data-hub-sdk'

// If you want to get the current user's linked providers, don't pass any address, so it queries data based on user's grill address,
// which is updated by the identity subscription.
// Send address as param only if you need to get the linked providers of another user.
export const useLinkedProviders = (
  address?: string,
  config = { enabled: true }
) => {
  const myGrillAddress = useMyGrillAddress()

  const { data: myLinkedIdentity, isLoading: isLoadingMy } =
    getLinkedIdentityQuery.useQuery(myGrillAddress ?? '', {
      enabled: !address && config.enabled && !!myGrillAddress,
    })
  const { data: linkedIdentity, isLoading: isLoadingMainAddress } =
    getLinkedIdentityFromMainAddressQuery.useQuery(address ?? '', {
      enabled: !!address && config.enabled,
    })

  const usedLinkedIdentity = address ? linkedIdentity : myLinkedIdentity
  const usedLoading = address ? isLoadingMainAddress : isLoadingMy

  return {
    providers: usedLinkedIdentity?.externalProviders,
    isLoading: usedLoading,
  }
}

export default function useLinkedAddress(
  address?: string,
  config = { enabled: true },
  identityProvider: IdentityProvider = IdentityProvider.EVM
) {
  const myGrillAddress = useMyGrillAddress()

  const { data: myLinkedIdentity, isLoading: isLoadingMy } =
    getLinkedIdentityQuery.useQuery(myGrillAddress ?? '', {
      enabled: !address && config.enabled && !!myGrillAddress,
    })
  const {
    data: linkedIdentity,
    refetch,
    isLoading: isLoadingMainAddress,
  } = getLinkedIdentityFromMainAddressQuery.useQuery(address ?? '', {
    enabled: !!address && config.enabled,
  })

  const usedLinkedIdentity = address ? linkedIdentity : myLinkedIdentity
  const usedLoading = address ? isLoadingMainAddress : isLoadingMy

  const providers = usedLinkedIdentity?.externalProviders.filter(
    (identity) => identity.provider === identityProvider.toString()
  )
  let latestAddress = ''
  let latestCreatedTime = 0
  let latestProviderId = ''
  providers?.forEach((provider) => {
    const currentCreated = new Date(provider.createdAtTime).getTime()
    if (currentCreated > latestCreatedTime) {
      latestAddress = provider.externalId
      latestCreatedTime = currentCreated
      latestProviderId = provider.id
    }
  })

  return {
    identityAddress: latestAddress,
    identityAddressProviderId: latestProviderId,
    isLoading: usedLoading,
    refetch,
  }
}
