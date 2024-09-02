import ChannelContentPage from '@/modules/telegram/channels/ChannelContentPage'
import { AppCommonProps } from '@/pages/_app'
import { getContentContainersQuery } from '@/services/datahub/content-containers/query'
import { getCommonStaticProps } from '@/utils/page'
import { dehydrate, QueryClient } from '@tanstack/react-query'

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps = getCommonStaticProps<AppCommonProps>(
  () => ({}),
  async (context) => {
    const rootPostId = context.params?.id as string
    if (!rootPostId) return

    const client = new QueryClient()
    try {
      await getContentContainersQuery.fetchQuery(client, {
        filter: { rootPostIds: [rootPostId], hidden: false },
      })
    } catch (err) {
      console.error('Error prefetching channel detail page', err)
    }

    return {
      props: {
        rootPostId,
        dehydratedState: dehydrate(client),
      },
    }
  }
)

export default ChannelContentPage
