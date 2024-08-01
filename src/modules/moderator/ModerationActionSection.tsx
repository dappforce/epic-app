import Button from '@/components/Button'
import { Checkbox } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { AiOutlineReload } from 'react-icons/ai'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'

type ModerationActionSectionProps = {
  setSelectedPostIds: (ids: string[]) => void
  selectedPostIds: string[]
  selectAll: () => void
  messageIds: string[]
}

const ModerationActionSection = ({
  selectedPostIds,
  setSelectedPostIds,
  selectAll,
  messageIds,
}: ModerationActionSectionProps) => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (selectedPostIds.length !== messageIds.length) {
      setEnabled(false)
    }
  }, [messageIds.length, selectedPostIds])

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

            <Button variant={'redOutline'}>Block</Button>
            <Button variant={'greenOutline'}>Approve</Button>
          </>
        )}
      </div>
      <div className='flex items-center gap-4'>
        <span>1-8 from 13455</span>
        <div className='flex items-center gap-1'>
          <Button variant={'transparent'} size={'circleSm'}>
            <MdOutlineKeyboardArrowLeft className='size-11' />
          </Button>
          <Button variant={'transparent'} size={'circleSm'}>
            <MdOutlineKeyboardArrowRight className='size-11' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModerationActionSection
