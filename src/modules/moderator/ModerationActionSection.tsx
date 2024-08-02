import Button from '@/components/Button'
import { Checkbox } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { AiOutlineReload } from 'react-icons/ai'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'
import ModerationButtons from './ModerationButtons'

type ModerationActionSectionProps = {
  setSelectedPostIds: (ids: string[]) => void
  selectedPostIds: string[]
  selectAll: () => void
  messagesByPage: string[]
  setPage: (page: number) => void
  totalDataCount: number
  pageSize: number
  chatId: string
  page: number
  loadMore: () => void
}

const ModerationActionSection = ({
  selectedPostIds,
  setSelectedPostIds,
  selectAll,
  messagesByPage,
  totalDataCount,
  pageSize,
  setPage,
  chatId,
  page,
  loadMore,
}: ModerationActionSectionProps) => {
  const [enabled, setEnabled] = useState(false)

  const offset = (page - 1) * pageSize

  const totalByPage = offset + pageSize

  useEffect(() => {
    if (selectedPostIds.length !== messagesByPage.length) {
      setEnabled(false)
    }
  }, [messagesByPage.length, selectedPostIds])

  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex items-center gap-4'>
        <Checkbox
          checked={enabled}
          onChange={(checked) => {
            setEnabled(checked)
            checked ? selectAll() : setSelectedPostIds([])
          }}
          className='group block size-8 rounded bg-slate-700 data-[checked]:bg-background-primary'
        >
          <svg
            className='stroke-white opacity-0 group-data-[checked]:opacity-100'
            viewBox='0 0 14 14'
            fill='none'
          >
            <path
              d='M3 8L6 11L11 3.5'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Checkbox>
        <Button variant={'transparent'} size='circle'>
          <AiOutlineReload />
        </Button>
        {!!selectedPostIds.length && (
          <>
            <span className='text-xl'>Selected: {selectedPostIds.length} </span>

            <ModerationButtons
              chatId={chatId}
              selectedMessageIds={selectedPostIds}
            />
          </>
        )}
      </div>
      <div className='flex items-center gap-4'>
        <span>
          {offset}-{totalByPage > totalDataCount ? totalDataCount : totalByPage}{' '}
          from {totalDataCount}
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
