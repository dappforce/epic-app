import { gql } from 'graphql-request'
import {
  CanAccountDoArgsInput,
  CreatePostOffChainInput,
  CreatePostOffChainMutation,
  CreatePostOffChainMutationVariables,
  GetCanAccountDoQuery,
  GetCanAccountDoQueryVariables,
  UpdatePostOptimisticInput,
  UpdatePostOptimisticMutation,
  UpdatePostOptimisticMutationVariables,
} from './generated'
import { datahubQueueRequest, throwErrorIfNotProcessed } from './utils'

const GET_CAN_ACCOUNT_DO = gql`
  query GetCanAccountDo($getAccountDo: CanAccountDoArgsInput!) {
    canAccountDo(args: $getAccountDo) {
      isAllowed
    }
  }
`
export async function getCanAccountDo(input: CanAccountDoArgsInput) {
  const { canAccountDo } = await datahubQueueRequest<
    GetCanAccountDoQuery,
    GetCanAccountDoQueryVariables
  >({
    document: GET_CAN_ACCOUNT_DO,
    variables: {
      getAccountDo: input,
    },
  })
  return canAccountDo.isAllowed
}

const CREATE_POST_OFFCHAIN_MUTATION = gql`
  mutation CreatePostOffChain(
    $createPostOffChainInput: CreatePostOffChainInput!
  ) {
    createPostOffChain(createPostOffChainInput: $createPostOffChainInput) {
      processed
      message
    }
  }
`
export async function createPostData(input: CreatePostOffChainInput) {
  const res = await datahubQueueRequest<
    CreatePostOffChainMutation,
    CreatePostOffChainMutationVariables
  >({
    document: CREATE_POST_OFFCHAIN_MUTATION,
    variables: {
      createPostOffChainInput: input,
    },
  })
  throwErrorIfNotProcessed(res.createPostOffChain, 'Failed to create post')
}

const UPDATE_POST_OPTIMISTIC_MUTATION = gql`
  mutation UpdatePostOptimistic(
    $updatePostOptimisticInput: UpdatePostOptimisticInput!
  ) {
    updatePostOptimistic(
      updatePostOptimisticInput: $updatePostOptimisticInput
    ) {
      processed
      message
    }
  }
`
export async function updatePostData(input: UpdatePostOptimisticInput) {
  const res = await datahubQueueRequest<
    UpdatePostOptimisticMutation,
    UpdatePostOptimisticMutationVariables
  >({
    document: UPDATE_POST_OPTIMISTIC_MUTATION,
    variables: {
      updatePostOptimisticInput: input,
    },
  })
  throwErrorIfNotProcessed(res.updatePostOptimistic, 'Failed to update post')
}
