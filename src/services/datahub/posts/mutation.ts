import { Signer } from '@/utils/account'
import { u8aToHex } from '@polkadot/util'
import { PostContent } from '@subsocial/api/types'
import {
  CreatePostCallParsedArgs,
  SynthCreatePostTxFailedCallParsedArgs,
  SynthCreatePostTxRetryCallParsedArgs,
  UpdatePostCallParsedArgs,
} from '@subsocial/data-hub-sdk'
import { gql } from 'graphql-request'
import sortKeys from 'sort-keys-recursive'
import {
  CreatePostOptimisticInput,
  CreatePostOptimisticMutation,
  CreatePostOptimisticMutationVariables,
  NotifyPostTxFailedOrRetryStatusMutation,
  NotifyPostTxFailedOrRetryStatusMutationVariables,
  SocialCallName,
  SocialEventDataType,
  UpdatePostBlockchainSyncStatusInput,
  UpdatePostOptimisticInput,
  UpdatePostOptimisticMutation,
  UpdatePostOptimisticMutationVariables,
} from '../generated-mutation'
import { PostKind } from '../generated-query'
import { datahubMutationRequest } from '../utils'

type DatahubParams<T> = T & {
  address: string
  signer: Signer | null
}

function augmentInputSig(signer: Signer | null, payload: { sig: string }) {
  if (!signer) throw new Error('Signer is not defined')
  const sortedPayload = sortKeys(payload)
  const sig = signer.sign(JSON.stringify(sortedPayload))
  const hexSig = u8aToHex(sig)
  payload.sig = hexSig
}

const CREATE_POST_OPTIMISTIC_MUTATION = gql`
  mutation CreatePostOptimistic(
    $createPostOptimisticInput: CreatePostOptimisticInput!
  ) {
    createPostOptimistic(
      createPostOptimisticInput: $createPostOptimisticInput
    ) {
      message
    }
  }
`
export async function createPostData({
  address,
  contentCid,
  rootPostId,
  spaceId,
  content,
  signer,
}: DatahubParams<{
  rootPostId?: string
  spaceId: string
  contentCid: string
  content: PostContent
}>) {
  const eventArgs: CreatePostCallParsedArgs = {
    forced: false,
    postKind: rootPostId ? PostKind.Comment : PostKind.RegularPost,
    rootPostId,
    spaceId,
    ipfsSrc: contentCid,
  }

  const input: CreatePostOptimisticInput = {
    dataType: SocialEventDataType.Optimistic,
    callData: {
      name: SocialCallName.CreatePost,
      signer: address || '',
      args: JSON.stringify(eventArgs),
    },
    content: JSON.stringify(content),
    providerAddr: address,
    sig: '',
  }
  augmentInputSig(signer, input)

  await datahubMutationRequest<
    CreatePostOptimisticMutation,
    CreatePostOptimisticMutationVariables
  >({
    document: CREATE_POST_OPTIMISTIC_MUTATION,
    variables: {
      createPostOptimisticInput: input,
    },
  })
}

const UPDATE_POST_OPTIMISTIC_MUTATION = gql`
  mutation UpdatePostOptimistic(
    $updatePostOptimisticInput: UpdatePostOptimisticInput!
  ) {
    updatePostOptimistic(
      updatePostOptimisticInput: $updatePostOptimisticInput
    ) {
      message
    }
  }
`
export async function updatePostData({
  address,
  postId,
  content,
  signer,
}: DatahubParams<{
  postId: string
  content: PostContent
}>) {
  const eventArgs: UpdatePostCallParsedArgs = {
    spaceId: null,
    hidden: null,
    postId,
  }

  const input: UpdatePostOptimisticInput = {
    dataType: SocialEventDataType.Optimistic,
    callData: {
      name: SocialCallName.UpdatePost,
      signer: address || '',
      args: JSON.stringify(eventArgs),
    },
    providerAddr: address,
    content: JSON.stringify(content),
    sig: '',
  }
  augmentInputSig(signer, input)

  await datahubMutationRequest<
    UpdatePostOptimisticMutation,
    UpdatePostOptimisticMutationVariables
  >({
    document: UPDATE_POST_OPTIMISTIC_MUTATION,
    variables: {
      updatePostOptimisticInput: input,
    },
  })
}

const NOTIFY_POST_TX_FAILED_OR_RETRY_STATUS_MUTATION = gql`
  mutation NotifyPostTxFailedOrRetryStatus(
    $updatePostBlockchainSyncStatusInput: UpdatePostBlockchainSyncStatusInput!
  ) {
    updatePostBlockchainSyncStatus(
      updatePostBlockchainSyncStatusInput: $updatePostBlockchainSyncStatusInput
    ) {
      message
    }
  }
`
export async function notifyCreatePostFailedOrRetryStatus({
  address,
  isRetrying,
  signer,
  ...args
}: Omit<
  DatahubParams<{
    isRetrying?: {
      success: boolean
    }
    reason?: string
    optimisticId: string
    timestamp: string
  }>,
  'txSig'
>) {
  let event:
    | {
        name: SocialCallName.SynthCreatePostTxFailed
        args: SynthCreatePostTxFailedCallParsedArgs
      }
    | {
        name: SocialCallName.SynthUpdatePostTxRetry
        args: SynthCreatePostTxRetryCallParsedArgs
      } = {
    name: SocialCallName.SynthCreatePostTxFailed,
    args,
  }
  if (isRetrying) {
    event = {
      name: SocialCallName.SynthUpdatePostTxRetry,
      args: {
        ...args,
        success: isRetrying.success,
      },
    }
  }

  const input: UpdatePostBlockchainSyncStatusInput = {
    dataType: SocialEventDataType.OffChain,
    callData: {
      name: event.name,
      signer: address || '',
      args: JSON.stringify(event.args),
    },
    providerAddr: address,
    sig: '',
  }
  augmentInputSig(signer, input)

  await datahubMutationRequest<
    NotifyPostTxFailedOrRetryStatusMutation,
    NotifyPostTxFailedOrRetryStatusMutationVariables
  >({
    document: NOTIFY_POST_TX_FAILED_OR_RETRY_STATUS_MUTATION,
    variables: {
      updatePostBlockchainSyncStatusInput: input,
    },
  })
}
