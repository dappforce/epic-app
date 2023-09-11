import { getPostQuery } from '@/services/api/query'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useEffect } from 'react'
import { SubscribePostSubscription } from '../generated'
import { datahubSubscription } from '../utils'
import { getCommentIdsByPostIdQuery } from './query'

const SUBSCRIBE_POST = gql`
  subscription SubscribePost {
    post {
      event
      entityId
      persistentId
    }
  }
`

let isSubscribed = false
const subscription = (queryClient: QueryClient) => {
  if (isSubscribed) return
  isSubscribed = true

  const client = datahubSubscription()
  let unsub = client.subscribe<SubscribePostSubscription, null>(
    {
      query: SUBSCRIBE_POST,
    },
    {
      complete: () => {
        console.log('subscription completed')
      },
      next: async (data) => {
        console.log('Subscription Data:', data.data)
        if (!data.data) return

        const id = data.data?.post.entityId
        const post = await getPostQuery.fetchQuery(queryClient, id)
        if (post?.struct.rootPostId) {
          getCommentIdsByPostIdQuery.setQueryData(
            queryClient,
            post?.struct.rootPostId,
            (oldIds) => {
              if (!oldIds) return oldIds
              if (oldIds.includes(id)) return oldIds
              return [...oldIds, id]
            }
          )
        }
      },
      error: () => {
        console.log('error subscription')
      },
    }
  )

  return () => {
    unsub()
    isSubscribed = false
  }
}

export function useSubscribeCommentIdsByPostId() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsub = subscription(queryClient)

    return () => {
      unsub?.()
    }
  }, [queryClient])
}
