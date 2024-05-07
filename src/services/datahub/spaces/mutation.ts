import { ApiDatahubSpaceMutationBody } from '@/pages/api/datahub/space'
import { apiInstance } from '@/services/api/utils'
import { getCurrentWallet } from '@/services/subsocial/hooks'
import { createMutationWrapper } from '@/services/subsocial/utils/mutation'
import { getMyMainAddress } from '@/stores/my-account'
import { MutationConfig } from '@/subsocial-query'
import { allowWindowUnload, preventWindowUnload } from '@/utils/window'
import { SpaceContent } from '@subsocial/api/types'
import {
  CreateSpaceCallParsedArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getDeterministicId } from '../posts/mutation'
import { DatahubParams, createSignedSocialDataEvent } from '../utils'
import { getSpaceQuery } from './query'

function getPermission(allAllowed = false) {
  return {
    CreateComments: true,
    CreatePosts: allAllowed,
    CreateSubspaces: allAllowed,
    DeleteAnyPost: allAllowed,
    DeleteAnySubspace: allAllowed,
    DeleteOwnComments: true,
    DeleteOwnPosts: true,
    DeleteOwnSubspaces: true,
    Downvote: true,
    HideAnyComment: allAllowed,
    HideAnyPost: allAllowed,
    HideAnySubspace: allAllowed,
    HideOwnComments: true,
    HideOwnPosts: true,
    HideOwnSubspaces: true,
    ManageRoles: allAllowed,
    OverridePostPermissions: allAllowed,
    OverrideSubspacePermissions: allAllowed,
    RepresentSpaceExternally: allAllowed,
    RepresentSpaceInternally: allAllowed,
    Share: true,
    SuggestEntityStatus: allAllowed,
    UpdateAnyPost: false,
    UpdateAnySubspace: allAllowed,
    UpdateEntityStatus: allAllowed,
    UpdateOwnComments: true,
    UpdateOwnPosts: true,
    UpdateOwnSubspaces: true,
    UpdateSpace: allAllowed,
    UpdateSpaceSettings: allAllowed,
    Upvote: true,
  }
}

export async function createSpaceData(
  params: DatahubParams<{
    cid?: string
    content: SpaceContent
  }>
) {
  const { args } = params
  const { content, cid } = args
  const eventArgs: CreateSpaceCallParsedArgs = {
    forced: false,
    ipfsSrc: cid,
    forcedData: null,
    permissions: {
      spaceOwner: getPermission(true),
      everyone: getPermission(),
      follower: getPermission(),
      none: getPermission(),
    },
  }

  const input = createSignedSocialDataEvent(
    socialCallName.create_space,
    params,
    eventArgs,
    content
  )

  await apiInstance.post<any, any, ApiDatahubSpaceMutationBody>(
    '/api/datahub/space',
    {
      action: 'create-space',
      payload: input as any,
    }
  )
}

// async function updatePostData(
//   params: DatahubParams<{
//     postId: string
//     changes: {
//       content?: {
//         cid: string
//         content: PostContent
//       }
//       hidden?: boolean
//     }
//   }>
// ) {
//   const { postId, changes } = params.args
//   const { content, hidden } = changes
//   const eventArgs: UpdatePostCallParsedArgs = {
//     spaceId: null,
//     hidden: hidden ?? null,
//     postId,
//     ipfsSrc: content?.cid ?? null,
//   }
//   const input = createSignedSocialDataEvent(
//     socialCallName.update_post,
//     params,
//     eventArgs,
//     content?.content
//   )

//   await apiInstance.post<any, any, ApiDatahubPostMutationBody>(
//     '/api/datahub/post',
//     {
//       action: 'update-post',
//       payload: input as any,
//     }
//   )
// }

type CommonParams = {
  content: {
    name?: string
    image?: string
    about?: string
  }
}
export type UpsertSpaceParams =
  | (CommonParams & Required<Pick<DatahubParams<{}>, 'timestamp' | 'uuid'>>)
  | (CommonParams & { spaceId: string })
function checkAction(data: UpsertSpaceParams) {
  if ('spaceId' in data) {
    return { payload: data, action: 'update' } as const
  }

  return { payload: data, action: 'create' } as const
}
function getMutatedSpaceId(data: UpsertSpaceParams) {
  const { payload, action } = checkAction(data)
  if (action === 'update') return payload.spaceId
  return getDeterministicId({
    timestamp: payload.timestamp.toString(),
    uuid: payload.uuid,
    account: getMyMainAddress() ?? '',
  })
}
function useUpsertSpaceRaw(config?: MutationConfig<UpsertSpaceParams>) {
  const client = useQueryClient()

  return useMutation({
    ...config,
    mutationFn: async (params: UpsertSpaceParams) => {
      const { content } = params
      const currentWallet = getCurrentWallet()
      if (!currentWallet.address) throw new Error('Please login')

      const { payload, action } = checkAction(params)
      if (action === 'update')
        throw new Error(
          'Please wait until we finalized your previous name change'
        )

      if (action === 'create') {
        createSpaceData({
          ...currentWallet,
          uuid: payload.uuid,
          timestamp: payload.timestamp,
          args: { content: content as any },
        })
      } else if (action === 'update') {
        // TODO: implement
        throw new Error('Not implemented')
      }
    },
    onMutate: (data) => {
      config?.onMutate?.(data)
      preventWindowUnload()
      const mainAddress = getMyMainAddress() ?? ''
      const spaceId = getMutatedSpaceId(data)

      getSpaceQuery.setQueryData(client, spaceId, (oldData) => {
        const oldSpaceContent = oldData?.content || {}
        return {
          id: spaceId,
          struct: {
            ...oldData?.struct,
            createdByAccount: mainAddress,
            canEveryoneCreatePosts: false,
            canFollowerCreatePosts: false,
            createdAtBlock: 0,
            createdAtTime: Date.now(),
            hidden: false,
            id: spaceId,
            ownerId: mainAddress,
          },
          content: {
            ...oldSpaceContent,
            ...data.content,
          } as SpaceContent,
        }
      })
    },
    onError: async (_, data, __) => {
      config?.onError?.(_, data, __)
      const spaceId = getMutatedSpaceId(data)
      getSpaceQuery.invalidate(client, spaceId)
    },
    onSuccess: async (_, data, __) => {
      config?.onSuccess?.(_, data, __)
      allowWindowUnload()
      const spaceId = getMutatedSpaceId(data)
      getSpaceQuery.invalidate(client, spaceId)
    },
  })
}
export const useUpsertSpace = createMutationWrapper(
  useUpsertSpaceRaw,
  'Failed to upsert space'
)