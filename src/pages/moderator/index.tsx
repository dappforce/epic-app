import ModeratorPage from '@/modules/moderator'
import { getCommonStaticProps } from '@/utils/page'
import { AppCommonProps } from '../_app'

export const getStaticProps = getCommonStaticProps<AppCommonProps>(
  () => ({
    head: {
      title: 'EPIC - A Meme-to-Earn Platform',
      description: 'Earn meme coins 💰 by posting and liking memes 🤣',
      disableZoom: true,
    },
  }),
  async () => {
    return {
      props: {},
    }
  }
)

export default ModeratorPage
