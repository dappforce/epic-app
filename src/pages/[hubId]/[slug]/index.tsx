import { CHAT_PER_PAGE } from '@/constants/chat'
import { getHubIdFromAlias } from '@/constants/config'
import ChatPage, { ChatPageProps } from '@/modules/chat/ChatPage'
import { AppCommonProps } from '@/pages/_app'
import { getPostsServer } from '@/pages/api/posts'
import { getProfilesServer } from '@/pages/api/profiles'
import { prefetchBlockedEntities } from '@/server/moderation/prefetch'
import { getPostQuery, getProfileQuery } from '@/services/api/query'
import {
  getPaginatedPostIdsByPostId,
  getPostMetadataQuery,
} from '@/services/datahub/posts/query'
import { removeUndefinedValues } from '@/utils/general'
import { getIpfsContentUrl } from '@/utils/ipfs'
import { getCommonStaticProps } from '@/utils/page'
import { getIdFromSlug } from '@/utils/slug'
import { validateNumber } from '@/utils/strings'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticPaths } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  // For chats page, skip pre-rendering, because it will cause super slow build time
  return {
    paths: [],
    fallback: 'blocking',
  }
}

function getValidatedChatId(slugParam: string) {
  const chatId = getIdFromSlug(slugParam)
  if (!chatId || !validateNumber(chatId)) return undefined

  return chatId
}

async function getChatsMessagesData(client: QueryClient, chatId: string) {
  const { messageIds, messages } = await getMessageIds(client, chatId)

  const owners = messages.map((message) => message.struct.ownerId)

  const ownersSet = new Set(owners)
  const chatPageOwnerIds = Array.from(ownersSet).slice(0, CHAT_PER_PAGE)

  const [profilesPromise] = await Promise.allSettled([
    getProfilesServer(chatPageOwnerIds),
  ])
  if (profilesPromise.status === 'fulfilled') {
    profilesPromise.value.forEach((profile) => {
      getProfileQuery.setQueryData(
        client,
        profile.address,
        removeUndefinedValues(profile)
      )
    })
  }

  return {
    messages,
    messageIds,
  }
}

async function getMessageIds(client: QueryClient, chatId: string) {
  const res = await getPaginatedPostIdsByPostId.fetchFirstPageQuery(
    client,
    chatId
  )

  getPaginatedPostIdsByPostId.invalidateFirstQuery(client, chatId)

  return {
    messageIds: res.data,
    messages: res.data.map((id) => getPostQuery.getQueryData(client, id)),
  }
}
async function prefetchPostMetadata(queryClient: QueryClient, chatId: string) {
  await getPostMetadataQuery.fetchQuery(queryClient, chatId)
}

async function prefetchChatAndBlockedEntities(
  queryClient: QueryClient,
  chatId: string,
  hubId: string
) {
  const [chatData] = await getPostsServer([chatId])
  getPostQuery.setQueryData(queryClient, chatId, chatData)

  const originalHubId = chatData.struct.spaceId
  const hubIds = [hubId]
  if (originalHubId && originalHubId !== hubId) {
    hubIds.push(originalHubId)
  }
  const chatEntityId = chatData.entityId ?? ''

  const blockedData = await prefetchBlockedEntities(queryClient, hubIds, [
    chatEntityId,
  ])
  if (blockedData) {
    let isChatModerated = false
    ;[...blockedData.blockedInSpaceIds, ...blockedData.blockedInAppIds].forEach(
      ({ blockedResources }) => {
        if (blockedResources.postId.includes(chatId)) {
          isChatModerated = true
        }
      }
    )

    return { chatData, isChatModerated }
  }
}

export const getStaticProps = getCommonStaticProps<
  ChatPageProps & AppCommonProps
>(
  () => ({
    head: { disableZoom: true },
  }),
  async (context) => {
    const hubIdOrAlias = context.params?.hubId as string
    const slugParam = context.params?.slug as string
    const chatId = getValidatedChatId(slugParam)
    if (!chatId) return undefined

    const hubId = getHubIdFromAlias(hubIdOrAlias) || hubIdOrAlias

    const queryClient = new QueryClient()

    let title: string | null = null
    let desc: string | null = null
    let image: string | null = null
    try {
      const [chatPromise] = await Promise.allSettled([
        prefetchChatAndBlockedEntities(queryClient, chatId, hubId),
        getChatsMessagesData(queryClient, chatId),
        prefetchPostMetadata(queryClient, chatId),
      ] as const)

      if (chatPromise.status === 'fulfilled' && chatPromise.value) {
        const { chatData, isChatModerated } = chatPromise.value
        if (isChatModerated) {
          return {
            redirect: {
              destination: '/',
              permanent: false,
            },
          }
        }

        if (!chatData.struct.hidden) {
          title = chatData?.content?.title || null
          desc = chatData?.content?.body || null

          const chatImage = chatData.content?.image
          image = chatImage ? getIpfsContentUrl(chatImage) : null
        }
      }
    } catch (err) {
      console.error('Error fetching for chat page: ', err)
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        chatId,
        hubId,
        head: {
          title,
          description: desc,
          image,
        },
      },
      revalidate: 2,
    }
  }
)

export default ChatPage
