import usePaginatedMessageIds from '@/components/chats/hooks/usePaginatedMessageIds'
import { getPostQuery } from '@/services/api/query'
import { useEffect, useMemo, useState } from 'react'
import ModerationActionSection from './ModerationActionSection'
import ModerationMemeItem from './ModerationMemeItem'

type PendingPostsListProps = {
  hubId: string
  chatId: string
}

const PendingPostsList = ({ hubId, chatId }: PendingPostsListProps) => {
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 8

  const {
    messageIds,
    hasMore,
    loadMore,
    totalDataCount,
    currentPage,
    isLoading,
  } = usePaginatedMessageIds({
    hubId,
    chatId,
    onlyDisplayUnapprovedMessages: true,
    pageSize: 8,
  })

  const renderedMessageQueries = getPostQuery.useQueries(messageIds)

  const postsIdsByPage = useMemo(() => {
    const offset = (page - 1) * pageSize

    return renderedMessageQueries.slice(offset, offset + 8)
  }, [renderedMessageQueries, page])

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
        page={page}
        setPage={setPage}
        totalDataCount={totalDataCount}
        loadMore={() => {
          hasMore && loadMore()
        }}
      />
      <div className='grid grid-cols-4 gap-4'>
        {postsIdsByPage.map(({ data: message }, index) => {
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
