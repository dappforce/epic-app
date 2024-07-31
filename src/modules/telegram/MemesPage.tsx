import Button from '@/components/Button'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import HomePageModals from '@/components/modals/HomePageModals'
import useIsMounted from '@/hooks/useIsMounted'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import { cx, mutedTextColorStyles } from '@/utils/class-names'
import { useEffect, useRef, useState } from 'react'
import { HiXMark } from 'react-icons/hi2'
import ChatContent from '../chat/HomePage/ChatContent'
import ContestEvmModal from './ContestEvmModal'

const MemesPage = () => {
  const [openPointsWidget, setOpenPointsWidget] = useState(false)

  useTgNoScroll()
  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <ChatContent isOpenPointsModal={openPointsWidget} />
      <HomePageModals />
      <ContestEvmModal />
      <HowToEarnMessage setOpenPointsWidget={setOpenPointsWidget} />
    </LayoutWithBottomNavigation>
  )
}

const HowToEarnMessage = ({
  setOpenPointsWidget,
}: {
  setOpenPointsWidget: (isOpen: boolean) => void
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const isMounted = useIsMounted()
  const isHowToEarnModalClosed = sessionStorage.getItem(
    'isHowToEarnModalClosed'
  )

  useEffect(() => {
    if (isHowToEarnModalClosed || !isMounted) return

    const handleUserActivity = (event: any) => {
      console.log(event.type)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIsModalVisible(true)
      }, 4000)
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart']

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity)
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
      clearTimeout(timerRef.current)
    }
  }, [isHowToEarnModalClosed, isMounted])

  if (!isModalVisible) return null

  return (
    <div className='absolute bottom-32 w-full animate-fade px-2 pb-2'>
      <div
        className='flex items-center gap-[10px] rounded-[20px] bg-slate-800 p-[10px] pr-4'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()

          setOpenPointsWidget(true)
          setIsModalVisible(false)

          sessionStorage.setItem('isHowToEarnModalClosed', 'true')
        }}
      >
        <span className='text-[40px]'>💰</span>
        <div className='flex flex-col gap-[10px]'>
          <span className='text-base font-bold leading-none'>
            How to earn here?
          </span>
          <span
            className={cx(
              mutedTextColorStyles,
              'text-sm font-medium leading-none'
            )}
          >
            View all earning methods
          </span>
        </div>
        <div className='flex min-w-fit flex-1 items-center justify-end'>
          <Button
            className='m-0 justify-self-end p-0 text-2xl text-text-muted'
            variant='transparent'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              setIsModalVisible(false)

              sessionStorage.setItem('isHowToEarnModalClosed', 'true')
            }}
          >
            <HiXMark />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MemesPage
