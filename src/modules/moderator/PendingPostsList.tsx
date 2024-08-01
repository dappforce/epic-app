import usePaginatedMessageIds from '@/components/chats/hooks/usePaginatedMessageIds'
import { getPostQuery } from '@/services/api/query'
import { useEffect, useState } from 'react'
import ModerationActionSection from './ModerationActionSection'
import ModerationMemeItem from './ModerationMemeItem'

type PendingPostsListProps = {
  hubId: string
  chatId: string
}

const PendingPostsList = ({ hubId, chatId }: PendingPostsListProps) => {
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
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
    <div className='flex flex-col gap-6'>
      <ModerationActionSection
        selectedPostIds={selectedPostIds}
        setSelectedPostIds={setSelectedPostIds}
        selectAll={() => {
          setSelectedPostIds(messageIds)
        }}
        messageIds={messageIds}
      />
      <div className='grid grid-cols-4 gap-4'>
        {renderedMessageQueries.map(({ data: message }, index) => {
          if (!message) return null

          return (
            <ModerationMemeItem
              key={message?.struct.id ?? index}
              message={message}
              chatId={chatId}
              hubId={hubId}
              selectedPostIds={selectedPostIds}
              setSelectedPostIds={setSelectedPostIds}
            />
          )
        })}
      </div>
    </div>
  )
}

export default PendingPostsList
