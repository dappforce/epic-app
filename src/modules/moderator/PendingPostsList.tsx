import usePaginatedMessageIds from '@/components/chats/hooks/usePaginatedMessageIds'
import { getPostQuery } from '@/services/api/query'
import { useEffect, useMemo } from 'react'
import ModerationActionSection from './ModerationActionSection'
import { useModerationContext } from './ModerationContext'
import ModerationMemeItem from './ModerationMemeItem'

type PendingPostsListProps = {
  hubId: string
  chatId: string
}

const PendingPostsList = ({ hubId, chatId }: PendingPostsListProps) => {
  const { setSelectedPostIds, page, pageSize } = useModerationContext()

  const { messageIds, hasMore, loadMore, totalDataCount, refetch, isFetching } =
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
  }, [renderedMessageQueries, offset, pageSize])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    setSelectedPostIds([])
  }, [page, setSelectedPostIds])

  return (
    <div className='flex h-full flex-col gap-2'>
      <ModerationActionSection
        chatId={chatId}
        isFetching={isFetching}
        offset={offset}
        messageIds={messageIds}
        totalDataCount={totalDataCount}
        refetch={refetch}
        loadMore={() => {
          hasMore && loadMore()
        }}
      />

      {postsIdsByPage.length === 0 && (
        <div className='flex w-fit self-center rounded-2xl bg-background-light/50 px-6 py-4 text-sm text-text-muted'>
          No pending posts
        </div>
      )}
      <div className='grid grid-cols-3 gap-4 lg:grid-cols-4'>
        {postsIdsByPage.length !== 0 &&
          postsIdsByPage.map(({ data: message }, index) => {
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
    </div>
  )
}

export default PendingPostsList
