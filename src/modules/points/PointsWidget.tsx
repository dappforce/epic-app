import Diamond from '@/assets/emojis/diamond.png'
import Laugh from '@/assets/emojis/laugh.png'
import Pointup from '@/assets/emojis/pointup.png'
import Speaker from '@/assets/emojis/speaker.png'
import Target from '@/assets/emojis/target.png'
import Thumbsup from '@/assets/emojis/thumbsup.png'
import BlueGradient from '@/assets/graphics/blue-gradient.png'
import Button from '@/components/Button'
import Card from '@/components/Card'
import LinkText from '@/components/LinkText'
import LinkAddressModal from '@/components/modals/LinkEvmAddressModal'
import RewardPerDayModal from '@/components/modals/RewardPerDayModal'
import SubsocialProfileModal from '@/components/profile/UpsertProfileModal'
import useIsMounted from '@/hooks/useIsMounted'
import { useSendEvent } from '@/stores/analytics'
import { cx } from '@/utils/class-names'
import { allowWindowScroll, preventWindowScroll } from '@/utils/window'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ComponentProps, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { FaChevronDown } from 'react-icons/fa'
import { HiChevronRight, HiOutlineChevronLeft, HiXMark } from 'react-icons/hi2'
import { LeaderboardContent } from '../telegram/StatsPage/LeaderboardSection'
import CheckInTaskPreview from './CheckInTaskPreview'
import LikeCount from './LikePreview'
import Points from './PointsPreview'

export default function PointsWidget({
  withPointsAnimation = true,
  customIsOpen,
  ...props
}: ComponentProps<'div'> & {
  isNoTgScroll?: boolean
  withPointsAnimation?: boolean
  customIsOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isMounted = useIsMounted()
  const sendEvent = useSendEvent()

  useHotkeys('esc', () => {
    if (isOpen) {
      setIsOpen(false)
    }
  })

  useEffect(() => {
    if (customIsOpen !== undefined) {
      setIsOpen(customIsOpen)
    }
  }, [customIsOpen])

  useEffect(() => {
    if (!props.isNoTgScroll) {
      if (isOpen) preventWindowScroll()
      else allowWindowScroll()
    }
  }, [props.isNoTgScroll, isOpen])

  return (
    <>
      <div
        {...props}
        className={cx(
          'z-10 flex h-14 w-full cursor-pointer items-center justify-between rounded-b-2xl',
          'bg-black/50 px-4.5 py-3 backdrop-blur-xl',
          props.className
        )}
        onClick={() => {
          setIsOpen(true)
          sendEvent('widget_expanded')
        }}
      >
        <div className='flex items-center gap-2'>
          <Image className='h-6 w-6' src={Thumbsup} alt='' />
          <span className='text-xl font-bold'>
            <LikeCount />
            /10
          </span>
        </div>
        <CheckInTaskPreview />
        <div className='flex items-center gap-2'>
          <Image className='h-7 w-7' src={Diamond} alt='' />
          <span className='flex items-center text-xl font-bold'>
            <Points withPointsAnimation={withPointsAnimation} shorten />
          </span>
          <FaChevronDown className='relative' />
        </div>
      </div>
      {isMounted && (
        <PointsDrawerContent isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
    </>
  )
}

type DrawerContentState = 'leaderboard' | 'stats'

function PointsDrawerContent({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const [drawerContentState, setDrawerContentState] =
    useState<DrawerContentState>('stats')
  const [openProfileModal, setOpenProfileModal] = useState(false)
  const [openEvmLinkModal, setOpenEvmLinkModal] = useState(false)

  const drawerContentByState: {
    [key in DrawerContentState]: {
      title: string
      content: () => JSX.Element
      withBackButton?: boolean
    }
  } = {
    leaderboard: {
      title: 'Leaderboard',
      content: () => <LeaderboardContent />,
      withBackButton: true,
    },
    stats: {
      title: 'My Progress',
      content: () => (
        <>
          <UserStatsSection />
          <DrawerLinks
            setIsOpen={setIsOpen}
            setDrawerContentState={setDrawerContentState}
          />
        </>
      ),
    },
  }

  const {
    content: Content,
    title,
    withBackButton,
  } = drawerContentByState[drawerContentState]

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
              {withBackButton && (
                <Button
                  size='circleSm'
                  variant='transparent'
                  className='-ml-1 mr-2 text-2xl text-text-muted'
                  onClick={() => setDrawerContentState('stats')}
                >
                  <HiOutlineChevronLeft />
                </Button>
              )}
              <span className='text-xl font-bold'>{title}</span>
            </div>

            <Button
              className='-mr-2'
              variant='transparent'
              size='circleSm'
              onClick={() => {
                setDrawerContentState('stats')
                setIsOpen(false)
              }}
            >
              <HiXMark className='text-2xl text-text-muted' />
            </Button>
          </div>
          <div className='relative mx-auto flex h-full w-full flex-col items-center px-4 pt-0'>
            <Content />
          </div>
        </div>
      </Transition>

      {/* Modals or Drawers with input cannot be put in another drawer, it causes bug because of telegram apps issue */}
      <SubsocialProfileModal
        title='✏️ Edit Profile'
        closeModal={() => setOpenProfileModal(false)}
        isOpen={openProfileModal}
      />
      <LinkAddressModal
        isOpen={openEvmLinkModal}
        closeModal={() => setOpenEvmLinkModal(false)}
      />
    </>,
    document.body
  )
}

const UserStatsSection = () => {
  const [openRewardModal, setOpenRewardModal] = useState(false)

  return (
    <>
      <div className='mb-10 flex w-full flex-col rounded-xl bg-slate-800 hover:cursor-pointer'>
        <div className='flex w-full items-center gap-4 px-4'>
          <div className='flex w-full flex-col gap-1 border-r border-slate-700 py-4'>
            <span className='text-text-muted'>LIKES LEFT TODAY:</span>
            <div className='flex items-center gap-3'>
              <Image src={Thumbsup} alt='' className='h-8 w-8' />
              <span className='text-[22px] font-bold'>
                <LikeCount />
                /10
              </span>
            </div>
            <div className='flex'>
              <LinkText href='/guide' variant='primary'>
                How it works?
              </LinkText>
            </div>
          </div>
          <div className='flex w-full flex-col gap-1 py-4'>
            <span className='text-text-muted'>POINTS EARNED:</span>
            <div
              className='mr-1 flex items-center gap-3'
              onClick={() => setOpenRewardModal(true)}
            >
              <Image src={Diamond} alt='' className='h-8 w-8' />
              <span className='flex h-8 items-center text-[22px] font-bold'>
                <Points shortWhenValueTooBig />{' '}
                <span className='ml-1 text-red-400'>*</span>
              </span>
            </div>
            <div className='flex'>
              <LinkText href='/guide' variant='primary'>
                How it works?
              </LinkText>
            </div>
          </div>
        </div>
      </div>
      <RewardPerDayModal
        isOpen={openRewardModal}
        close={() => {
          setOpenRewardModal(false)
        }}
      />
    </>
  )
}

const cardStyles =
  'flex w-full items-center gap-4 bg-background-light px-[10px] py-2'

const DrawerLinks = ({
  setIsOpen,
  setDrawerContentState,
}: {
  setIsOpen: (isOpen: boolean) => void
  setDrawerContentState: (drawerContentState: DrawerContentState) => void
}) => {
  const onClose = () => {
    setDrawerContentState('stats')
    setIsOpen(false)
  }
  return (
    <div className='flex w-full flex-1 flex-col gap-[14px] pb-8'>
      <span className='text-center text-lg font-bold text-text-muted'>
        How to earn Points:
      </span>
      <LinkWrapper close={onClose} href='/tg/tasks'>
        <Card className={cardStyles}>
          <Image src={Target} alt='' className='h-12 w-12 flex-shrink-0' />
          {/* <Image src={Tasks} alt=''  /> */}
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-base font-bold'>Complete Tasks</span>
            </div>
            <p className='text-sm text-text-muted'>
              Choose a task and get rewarded for its completion.
            </p>
          </div>
          <Button
            size='circle'
            className='ml-auto flex-shrink-0 text-lg'
            variant='transparent'
          >
            <HiChevronRight />
          </Button>
        </Card>
      </LinkWrapper>
      <LinkWrapper close={onClose} href='/tg/memes'>
        <Card className={cardStyles}>
          <Image src={Laugh} alt='' className='h-12 w-12 flex-shrink-0' />
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-base font-bold'>Meme2Earn</span>
            </div>
            <p className='text-sm text-text-muted'>
              Post and like memes to earn even more Points.
            </p>
          </div>
          <Button
            size='circle'
            className='ml-auto flex-shrink-0 text-lg'
            variant='transparent'
          >
            <HiChevronRight />
          </Button>
        </Card>
      </LinkWrapper>
      <LinkWrapper close={onClose} href='/tg/friends'>
        <Card className={cardStyles}>
          <Image src={Speaker} alt='' className='h-12 w-12 flex-shrink-0' />
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-base font-bold'>Invite2Earn</span>
            </div>
            <p className='text-sm text-text-muted'>
              Invite your friends and earn 10% from their Points.
            </p>
          </div>
          <Button
            size='circle'
            className='ml-auto flex-shrink-0 text-lg'
            variant='transparent'
          >
            <HiChevronRight />
          </Button>
        </Card>
      </LinkWrapper>
      <LinkWrapper close={onClose} href='/tg/tap'>
        <Card className={cardStyles}>
          <Image src={Pointup} alt='' className='h-12 w-12 flex-shrink-0' />
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <span className='text-base font-bold'>Tap2Earn</span>
            </div>
            <p className='text-sm text-text-muted'>
              Tap on the cat emoji and earn Points.
            </p>
          </div>
          <Button
            size='circle'
            className='ml-auto flex-shrink-0 text-lg'
            variant='transparent'
          >
            <HiChevronRight />
          </Button>
        </Card>
      </LinkWrapper>
    </div>
  )
}

function LinkWrapper({
  href,
  children,
  close,
}: {
  href: string
  children: React.ReactNode
  close: () => void
}) {
  const router = useRouter()

  const link = (
    <Link
      href={href}
      className='rounded-2xl outline-none ring-2 ring-transparent ring-offset-0 ring-offset-transparent transition focus-within:ring-background-lightest hover:ring-background-lightest'
    >
      {children}
    </Link>
  )

  if (router.pathname === href) {
    return (
      <span
        onClick={close}
        className='rounded-2xl outline-none ring-2 ring-transparent ring-offset-0 ring-offset-transparent transition focus-within:ring-background-lightest hover:ring-background-lightest'
      >
        {children}
      </span>
    )
  }
  return link
}
