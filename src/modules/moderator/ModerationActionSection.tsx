import Button from '@/components/Button'
import { getPostQuery } from '@/services/api/query'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AiOutlineReload } from 'react-icons/ai'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'
import BlockAndApproveButtons from './BlockAndApproveButtons'
import ModerationCheckbox from './Checkbox'
import { useModerationContext } from './ModerationContext'

type ModerationActionSectionProps = {
  chatId: string
  offset: number
  messageIds: string[]
  totalDataCount: number
  refetch?: () => void
  loadMore: () => void
  isFetching?: boolean
}

const ModerationActionSection = ({
  totalDataCount,
  messageIds,
  offset,
  chatId,
  isFetching,
  refetch,
  loadMore,
}: ModerationActionSectionProps) => {
  const { selectedPostIds, setSelectedPostIds, page, setPage, pageSize } =
    useModerationContext()
  const [enabled, setEnabled] = useState(false)
  const queryClient = useQueryClient()

  const totalByPage = offset + pageSize
  const messagesByPage = messageIds.slice(offset, offset + pageSize)

  useEffect(() => {
    if (selectedPostIds.length !== messagesByPage.length) {
      setEnabled(false)
    }
  }, [messagesByPage.length, selectedPostIds])

  const onSuccess = () => {
    selectedPostIds.forEach((postId) => {
      getPostQuery.invalidate(queryClient, postId)
    })
    setSelectedPostIds([])

    refetch?.()
  }

  const selectAll = () => {
    setSelectedPostIds(messageIds.slice(offset, offset + pageSize))
  }

  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex items-center gap-4'>
        <ModerationCheckbox
          checked={enabled}
          onChange={(checked) => {
            setEnabled(checked)
            checked ? selectAll() : setSelectedPostIds([])
          }}
          className='h-8 w-8'
        />
        <Button
          variant={'transparent'}
          onClick={() => {
            refetch?.()
          }}
          size='circleSm'
          isLoading={isFetching}
          loadingText=''
        >
          <AiOutlineReload className='size-5' />
        </Button>
        {!!selectedPostIds.length && (
          <>
            <span className='text-base'>
              Selected: {selectedPostIds.length}{' '}
            </span>

            <BlockAndApproveButtons
              chatId={chatId}
              selectedMessageIds={selectedPostIds}
              onSuccess={onSuccess}
            />
          </>
        )}
      </div>
      <div className='flex items-center gap-4 text-base'>
        <span>
          {messageIds.length ? offset + 1 : 0}-
          {totalByPage > totalDataCount ? totalDataCount : totalByPage} from{' '}
          {totalDataCount}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            variant={'transparent'}
            onClick={() => {
              setPage(page - 1)
            }}
            size={'circleSm'}
            disabled={page === 1}
          >
            <MdOutlineKeyboardArrowLeft className='size-11' />
          </Button>
          <Button
            onClick={() => {
              loadMore()
              setPage(page + 1)
            }}
            variant={'transparent'}
            size={'circleSm'}
            disabled={page * 8 >= totalDataCount}
          >
            <MdOutlineKeyboardArrowRight className='size-11' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModerationActionSection
