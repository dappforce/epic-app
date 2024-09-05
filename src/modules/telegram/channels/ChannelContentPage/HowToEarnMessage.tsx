import Button from '@/components/Button'
import LikeIntroModal from '@/components/modals/LikeIntroModal'
import useIsMounted from '@/hooks/useIsMounted'
import { useSendEvent } from '@/stores/analytics'
import { cx, mutedTextColorStyles } from '@/utils/class-names'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useRef, useState } from 'react'
import { HiXMark } from 'react-icons/hi2'

export function useIsHowToEarnMessageClosedStorage() {
  return useLocalStorage('isHowToEarnModalClosed', 'false')
}

export default function HowToEarnMessage() {
  const [isHowToEarnMessageClosed, setIsHowToEarnMessageClosed] =
    useIsHowToEarnMessageClosedStorage()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isOpenLikeIntro, setIsOpenLikeIntro] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const isMounted = useIsMounted()

  const sendEvent = useSendEvent()

  useEffect(() => {
    if (isHowToEarnMessageClosed === 'true' || !isMounted) return

    const handleUserActivity = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        sendEvent('open_how_to_earn_message')
        setIsModalVisible(true)
      }, 4000)
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart']

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
      clearTimeout(timerRef.current)
    }
  }, [isHowToEarnMessageClosed, isMounted, sendEvent])

  return (
    <>
      {isModalVisible && (
        <div className='absolute bottom-32 w-full animate-fade px-2 pb-2'>
          <div
            className='flex items-center gap-[10px] rounded-[20px] bg-slate-800 p-[10px] pr-4'
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              setIsOpenLikeIntro(true)
              setIsModalVisible(false)

              setIsHowToEarnMessageClosed('true')

              sendEvent('click_how_to_earn_message')
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

                  sendEvent('close_how_to_earn_message')
                  setIsHowToEarnMessageClosed('true')
                }}
              >
                <HiXMark />
              </Button>
            </div>
          </div>
        </div>
      )}
      <LikeIntroModal
        isOpen={isOpenLikeIntro}
        closeModal={() => setIsOpenLikeIntro(false)}
      />
    </>
  )
}
