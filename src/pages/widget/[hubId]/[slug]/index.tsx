import { CHAT_PER_PAGE } from '@/constants/chat'
import { getHubIdFromAlias } from '@/constants/config'
import ChatPage, { ChatPageProps } from '@/modules/chat/ChatPage'
import { AppCommonProps } from '@/pages/_app'
import { getPostsServer } from '@/pages/api/posts'
import { getPricesFromCache } from '@/pages/api/prices'
import { getProfilesServer } from '@/pages/api/profiles'
import { prefetchBlockedEntities } from '@/server/moderation/prefetch'
import { getPostQuery, getProfileQuery } from '@/services/api/query'
import { getLinkedIdentityQuery } from '@/services/datahub/identity/query'
import {
  getPaginatedPostIdsByPostId,
  getPostMetadataQuery,
} from '@/services/datahub/posts/query'
import {
  coingeckoTokenIds,
  getPriceQuery,
} from '@/services/subsocial/prices/query'
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

async function getChatsData(client: QueryClient, chatId: string) {
  const { messageIds, messages } = await getMessageIds(client, chatId)

  const owners = messages
    .map((message) => message?.struct.ownerId)
    .filter(Boolean)

  const ownersSet = new Set(owners)
  const chatPageOwnerIds = Array.from(ownersSet).slice(0, CHAT_PER_PAGE)

  const [profilesPromise, prices] = await Promise.allSettled([
    getProfilesServer(chatPageOwnerIds),
    getPricesFromCache(Object.values(coingeckoTokenIds)),
    ...chatPageOwnerIds.map((ownerId) =>
      getLinkedIdentityQuery.fetchQuery(client, ownerId)
    ),
  ] as const)
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
    prices: prices.status === 'fulfilled' ? prices.value : [],
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
      const [chatData] = await getPostsServer([chatId])
      const originalHubId = chatData.struct.spaceId
      const hubIds = [hubId]
      if (originalHubId && originalHubId !== hubId) {
        hubIds.push(originalHubId)
      }

      const chatEntityId = chatData.entityId ?? ''
      const [{ prices }, blockedData] = await Promise.all([
        getChatsData(queryClient, chatId),
        prefetchBlockedEntities(queryClient, hubIds, [chatEntityId]),
        prefetchPostMetadata(queryClient, chatId),
      ] as const)

      if (blockedData) {
        let isChatModerated = false
        ;[
          ...blockedData.blockedInSpaceIds,
          ...blockedData.blockedInAppIds,
        ].forEach(({ blockedResources }) => {
          if (blockedResources.postId.includes(chatId)) {
            isChatModerated = true
          }
        })
        if (isChatModerated)
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

      getPostQuery.setQueryData(queryClient, chatId, chatData)

      prices.forEach((price) => {
        const { id, current_price } = price || {}

        if (id && current_price) {
          getPriceQuery.setQueryData(queryClient, id, {
            id,
            current_price: current_price?.toString(),
          })
        }
      })
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
