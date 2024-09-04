async function updateExternalProvider(
  params: DatahubParams<
    SocialCallDataArgs<'synth_update_linked_identity_external_provider'>
  >
) {
  const input = await createSignedSocialDataEvent(
    socialCallName.synth_update_linked_identity_external_provider,
    params,
    params.args
  )

  await apiInstance.post<any, any, ApiDatahubIdentityBody>(
    '/api/datahub/identity',
    {
      payload: input,
      id: params.args.externalProvider?.id ?? '',
      provider:
        params.args.externalProvider?.provider ?? IdentityProvider.FARCASTER,
    }
  )
}

export const useUpdateExternalProvider = mutationWrapper(
  async (data: SynthUpdateLinkedIdentityExternalProviderCallParsedArgs) => {
    await updateExternalProvider({
      ...getCurrentWallet(),
      args: data,
    })
  },
  {
    onSuccess: (_, { externalProvider }) => {
      reloadEveryIntervalUntilLinkedIdentityFound((identity) => {
        const isFound = !!identity?.externalProviders.find(
          (p) =>
            // @ts-expect-error different provider for IdentityProvider, one from generated type, one from sdk
            p.provider === externalProvider.provider &&
            p.externalId === externalProvider.id
        )
        if (!externalProvider.enabled) return !isFound
        return isFound
      })
    },
  }
)
