import ChannelContentPage from '@/modules/telegram/channels/ChannelContentPage'
import { getCommonStaticProps } from '@/utils/page'

export function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  }
}

export const getStaticProps = getCommonStaticProps(() => ({}))

export default ChannelContentPage
