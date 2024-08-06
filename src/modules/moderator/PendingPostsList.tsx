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

  const { messageIds, hasMore, loadMore, totalDataCount, refetch, isLoading } =
    usePaginatedMessageIds({
      hubId,
      chatId,
      onlyDisplayUnapprovedMessages: true,
      pageSize,
    })

  const renderedMessageQueries = getPostQuery.useQueries(messageIds)

  const offset = (page - 1) * pageSize

  const postsIdsByPage = useMemo(() => {
    return renderedMessageQueries.slice(offset, offset + pageSize)
  }, [renderedMessageQueries, offset])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    setSelectedPostIds([])
  }, [page])

  return (
    <div className='flex flex-col gap-6'>
      <ModerationActionSection
        selectedPostIds={selectedPostIds}
        chatId={chatId}
        setSelectedPostIds={setSelectedPostIds}
        selectAll={() => {
          setSelectedPostIds(messageIds.slice(offset, offset + pageSize))
        }}
        messagesByPage={messageIds.slice(offset, offset + pageSize)}
        page={page}
        setPage={setPage}
        totalDataCount={totalDataCount}
        pageSize={pageSize}
        refetch={refetch}
        loadMore={() => {
          hasMore && loadMore()
        }}
      />
      <div className='grid grid-cols-3 gap-4 lg:grid-cols-4'>
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
