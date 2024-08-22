import BlueGradient from '@/assets/graphics/blue-gradient.png'
import Button from '@/components/Button'
import { cx } from '@/utils/class-names'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { HiOutlineChevronLeft, HiXMark } from 'react-icons/hi2'
import { LeaderboardContent } from '../StatsPage/LeaderboardSection'

type LeaderboardByPontsModalProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const LeaderboardByPointsModal = ({
  isOpen,
  setIsOpen,
}: LeaderboardByPontsModalProps) => {
  return createPortal(
    <>
      <Transition
        appear
        show={isOpen}
        as='div'
        className='fixed inset-0 z-10 h-full w-full bg-background transition duration-300'
        enterFrom={cx('opacity-0')}
        enterTo='opacity-100'
        leaveFrom='h-auto'
        leaveTo='opacity-0 !duration-150'
      />
      <Transition
        appear
        show={isOpen}
        as='div'
        className='fixed inset-0 z-10 flex h-full w-full flex-col bg-background pb-20 transition duration-300'
        enterFrom={cx('opacity-0 -translate-y-48')}
        enterTo='opacity-100 translate-y-0'
        leaveFrom='h-auto'
        leaveTo='opacity-0 -translate-y-24 !duration-150'
      >
        <div className='mx-auto flex w-full max-w-screen-md flex-1 flex-col overflow-auto'>
          <Image
            src={BlueGradient}
            priority
            alt=''
            className='absolute left-1/2 top-0 w-full -translate-x-1/2'
          />
          <div className='relative mx-auto flex w-full items-center justify-between px-4 py-4'>
            <div className='flex items-center gap-2'>
              <Button
                size='circleSm'
                variant='transparent'
                className='-ml-1 mr-2 text-2xl text-text-muted'
                onClick={() => setIsOpen(false)}
              >
                <HiOutlineChevronLeft />
              </Button>
              <span className='text-xl font-bold'>Leaderboard</span>
            </div>

            <Button
              className='-mr-2'
              variant='transparent'
              size='circleSm'
              onClick={() => {
                setIsOpen(false)
              }}
            >
              <HiXMark className='text-2xl text-text-muted' />
            </Button>
          </div>
          <div className='relative mx-auto flex h-full w-full flex-col items-center px-4 pt-0'>
            <LeaderboardContent />
          </div>
        </div>
      </Transition>
    </>,
    document.body
  )
}

export default LeaderboardByPointsModal
