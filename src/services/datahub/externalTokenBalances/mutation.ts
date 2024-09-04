import { apiInstance } from '@/services/api/utils'
import { getCurrentWallet } from '@/services/subsocial/hooks'
import mutationWrapper from '@/subsocial-query/base'
import {
  SocialCallDataArgs,
  socialCallName,
  SynthSocialProfileSyncExternalTokenBalanceCallParsedArgs,
} from '@subsocial/data-hub-sdk'
import { createSignedSocialDataEvent, DatahubParams } from '../utils'

async function updateExternalProvider(
  params: DatahubParams<
    SocialCallDataArgs<'synth_social_profile_sync_external_token_balance'>
  >
) {
  const input = await createSignedSocialDataEvent(
    socialCallName.synth_social_profile_sync_external_token_balance,
    params,
    params.args
  )

  await apiInstance.post<any, any, {}>('/api/datahub/external-token', {
    payload: input,
  })
}

export const useUpdateExternalProvider = mutationWrapper(
  async (data: SynthSocialProfileSyncExternalTokenBalanceCallParsedArgs) => {
    await updateExternalProvider({
      ...getCurrentWallet(),
      args: data,
    })
  }
)
