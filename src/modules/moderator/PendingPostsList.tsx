import usePaginatedMessageIds from '@/components/chats/hooks/usePaginatedMessageIds'
import { getPostQuery } from '@/services/api/query'
import { useEffect } from 'react'
import ModerationMemeItem from './ModerationMemeItem'

type PendingPostsListProps = {
  hubId: string
  chatId: string
}

const PendingPostsList = ({ hubId, chatId }: PendingPostsListProps) => {
  const {
    messageIds,
    hasMore,
    loadMore,
    unfilteredMessageIds,
    totalDataCount,
    currentPage,
    isLoading,
  } = usePaginatedMessageIds({
    hubId,
    chatId,
    onlyDisplayUnapprovedMessages: true,
  })

  const renderedMessageQueries = getPostQuery.useQueries(messageIds)

  useEffect(() => {
    loadMore()
  }, [loadMore])

  return (
    <div className='grid grid-cols-4 gap-4'>
      {renderedMessageQueries.map(({ data: message }, index) => {
        if (!message) return null

        return (
          <ModerationMemeItem
            key={message?.struct.id ?? index}
            message={message}
            chatId={chatId}
            hubId={hubId}
          />
        )
      })}
    </div>
  )
}

export default PendingPostsList
