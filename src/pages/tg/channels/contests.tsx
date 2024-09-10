import ContestsPage from '@/modules/telegram/channels/ContestsPage'
import { AppCommonProps } from '@/pages/_app'
import { getContentContainersQuery } from '@/services/datahub/content-containers/query'
import { ContentContainerType } from '@/services/datahub/generated-query'
import { getCommonStaticProps } from '@/utils/page'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export const getStaticProps = getCommonStaticProps<AppCommonProps>(
  () => ({}),
  async () => {
    const client = new QueryClient()
    let defaultSelectedTab = 'Ongoing'
    try {
      const [ongoingPromise, upcomingPromise, historyPromise] =
        await Promise.allSettled([
          // ongoing
          getContentContainersQuery.fetchQuery(client, {
            filter: {
              isOpen: true,
              isClosed: false,
              hidden: false,
              containerType: [ContentContainerType.Contest],
            },
          }),
          // upcoming
          getContentContainersQuery.fetchQuery(client, {
            filter: {
              isOpen: false,
              hidden: false,
              containerType: [ContentContainerType.Contest],
            },
          }),
          // history
          getContentContainersQuery.fetchQuery(client, {
            filter: {
              isClosed: true,
              hidden: false,
              containerType: [ContentContainerType.Contest],
            },
          }),
        ])

      if (
        ongoingPromise.status === 'fulfilled' &&
        ongoingPromise.value.data.length === 0
      ) {
        defaultSelectedTab = 'History'
      } else if (
        historyPromise.status === 'fulfilled' &&
        historyPromise.value.data.length === 0 &&
        upcomingPromise.status === 'fulfilled' &&
        upcomingPromise.value.data.length > 0
      ) {
        defaultSelectedTab = 'Upcoming'
      }
    } catch (err) {
      console.error('Error prefetching contests page', err)
    }

    return {
      props: {
        dehydratedState: dehydrate(client),
        defaultSelectedTab,
      },
      revalidate: 15 * 60,
    }
  }
)

export default ContestsPage
