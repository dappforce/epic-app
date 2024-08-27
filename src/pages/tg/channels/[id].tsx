import ChannelContentPage from '@/modules/telegram/channels/ChannelContentPage'
import { getContentContainersQuery } from '@/services/datahub/content-containers/query'
import { getCommonStaticProps } from '@/utils/page'
import { QueryClient } from '@tanstack/react-query'

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps = getCommonStaticProps(
  () => ({}),
  async (context) => {
    const containerId = context.params?.id as string
    if (!containerId) return

    const client = new QueryClient()
    try {
      await getContentContainersQuery.fetchQuery(client, {
        filter: { hidden: false },
      })
    } catch (err) {
      console.error('Error prefetching channel detail page', err)
    }

    return {
      props: {
        containerId,
      },
    }
  }
)

export default ChannelContentPage
