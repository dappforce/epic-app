import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { gql } from 'graphql-request'
import {
  LinkIdentityMutation,
  LinkIdentityMutationVariables,
} from './generated'
import { datahubQueueRequest, throwErrorIfNotProcessed } from './utils'

const SYNC_EXTERNAL_TOKEN_BALANCES = gql`
  mutation SyncExternalTokenBalances($args: CreateMutateLinkedIdentityInput!) {
    socialProfileSyncExternalTokenBalance(args: $args) {
      processed
      callId
      message
    }
  }
`

export async function syncExternalTokenBalances(
  input: SocialEventDataApiInput
) {
  const res = await datahubQueueRequest<
    LinkIdentityMutation,
    LinkIdentityMutationVariables
  >({
    document: SYNC_EXTERNAL_TOKEN_BALANCES,
    variables: {
      args: input as any,
    },
  })
  throwErrorIfNotProcessed(
    res.initLinkedIdentity,
    'Failed to sync external token balances'
  )
}
