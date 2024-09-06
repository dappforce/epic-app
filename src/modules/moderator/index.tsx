import { env } from '@/env.mjs'
import { useSearchParams } from 'next/navigation'
import ModeratedContentByModerator from './ModeratedContentByModerator'
import { ModerationContextWrapper } from './ModerationContext'
import ModeratorHeader from './ModeratorHeader'
import PendingPostsList from './PendingPostsList'

const ModeratorPage = () => {
  return (
    <ModerationContextWrapper>
      <div className='mb-6 flex flex-col gap-2'>
        <ModeratorHeader />
        <Content />
      </div>
    </ModerationContextWrapper>
  )
}

const Content = () => {
  const searchParams = useSearchParams()
  const moderator = searchParams?.get('moderator')
  const channel = searchParams?.get('channel')

  return (
    <div className='flex  justify-center'>
      <div className='mx-4 w-full max-w-screen-xl'>
        {!moderator ? (
          <PendingPostsList
            hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
            chatId={channel || env.NEXT_PUBLIC_MAIN_CHAT_ID}
          />
        ) : (
          <ModeratedContentByModerator
            moderator={moderator}
            hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
            chatId={channel || env.NEXT_PUBLIC_MAIN_CHAT_ID}
          />
        )}
      </div>
    </div>
  )
}

export default ModeratorPage
