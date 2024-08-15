import { linkIdentity } from '@/server/datahub-queue/identity'
import {
  datahubQueryRequest,
  datahubSubscription,
} from '@/services/datahub/utils'
import { generateManuallyTriggeredPromise } from '@/utils/promise'
import {
  DataHubSubscriptionEventEnum,
  SocialEventDataApiInput,
} from '@subsocial/data-hub-sdk'
import { gql } from 'graphql-request'

const sessionCallbacks: Map<string, (address: string) => void> = new Map()

const SUBSCRIBE_LINKING_IDENTITY = gql`
  subscription SubscribeLinkingIdentity {
    linkedIdentitySubscription {
      event
      entity {
        session {
          id
          linkedIdentity {
            id
          }
        }
      }
    }
  }
`
let isActive = false
function subscribeToLinkingIdentity() {
  if (isActive) return false
  isActive = true

  console.log('start subscription')
  const client = datahubSubscription()
  let unsub = client.subscribe<{
    linkedIdentitySubscription: {
      event: DataHubSubscriptionEventEnum
      entity: {
        session: {
          id: string
          linkedIdentity: {
            id: string
          }
        }
      }
    }
  }>(
    {
      query: SUBSCRIBE_LINKING_IDENTITY,
    },
    {
      complete: () => undefined,
      next: async (data) => {
        const eventData = data.data?.linkedIdentitySubscription
        if (!eventData) return

        console.log('GET EVENT', eventData.event)
        if (
          eventData.event ===
          DataHubSubscriptionEventEnum.LINKED_IDENTITY_SESSION_CREATED
        ) {
          const sessionAddress = eventData.entity.session.id
          const linkedIdentity = eventData.entity.session.linkedIdentity
          console.log(sessionCallbacks.keys(), sessionAddress)
          if (sessionCallbacks.has(sessionAddress)) {
            sessionCallbacks.get(sessionAddress)!(linkedIdentity.id)
            sessionCallbacks.delete(sessionAddress)
          }
        }

        if (sessionCallbacks.size === 0) {
          unsub()
          isActive = false
        }
      },
      error: () => {
        console.log('error subscription')
      },
    }
  )

  return true
}

export async function linkIdentityWithResult(
  sessionAddress: string,
  input: SocialEventDataApiInput
) {
  subscribeToLinkingIdentity()

  const { getPromise, getResolver } = generateManuallyTriggeredPromise()
  const promise = getPromise()

  let linkedIdentityAddress = ''
  sessionCallbacks.set(sessionAddress, (address: string) => {
    getResolver()()
    linkedIdentityAddress = address
  })

  console.log('LINK IDENTITY')
  await linkIdentity(input)

  function checkLinkedIdentityManually(retry: number = 0) {
    setTimeout(async () => {
      // if no response from subscription
      if (sessionCallbacks.has(sessionAddress)) {
        console.log('TIMEOUT')
        const res = await datahubQueryRequest<{
          linkedIdentity: {
            id: string
          }
        }>({
          document: gql`
            query GetLinkedIdentityAddress($sessionAddress: String!) {
              linkedIdentity(where: { sessionAddress: $sessionAddress }) {
                id
              }
            }
          `,
          variables: { sessionAddress },
        })
        if (res.linkedIdentity.id) {
          sessionCallbacks.delete(sessionAddress)
          getResolver()()
          linkedIdentityAddress = res.linkedIdentity.id
        } else {
          if (retry < 3) checkLinkedIdentityManually(retry + 1)
          else {
            sessionCallbacks.delete(sessionAddress)
            getResolver()()
            linkedIdentityAddress = res.linkedIdentity.id
          }
        }
      }
    }, 1000)
  }
  checkLinkedIdentityManually()

  await promise

  return linkedIdentityAddress
}
