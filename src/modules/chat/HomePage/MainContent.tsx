import DummyProfilePic from '@/assets/graphics/dummy-profile-pic.png'
import EpicTokenIllust from '@/assets/graphics/epic-token-illust.svg'
import PointsBorder from '@/assets/graphics/home/points-border.svg'
import FarcasterLogo from '@/assets/logo/farcaster.svg'
import GalxeLogo from '@/assets/logo/galxe.svg'
import Button from '@/components/Button'
import Card, { CardProps } from '@/components/Card'
import { Skeleton } from '@/components/SkeletonFallback'
import { spaceMono } from '@/fonts'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import Image from 'next/image'
import { FiShare } from 'react-icons/fi'
import { HiOutlineInformationCircle } from 'react-icons/hi2'

export default function MainContent() {
  return (
    <div className='flex flex-col gap-8 pt-4'>
      <MainCard />
      <div className='flex flex-col gap-4 @container'>
        <span className='text-lg font-semibold'>Earn more points</span>
        <div className='grid grid-cols-1 gap-4 @lg:grid-cols-2'>
          <Card className='relative flex flex-col bg-[#8A63D20D]'>
            <FarcasterLogo className='absolute right-2 top-2 text-5xl text-[#8A63D2]' />
            <div className='mb-1 flex items-center gap-2'>
              <span className='font-semibold'>Farcaster Memes</span>
              <HiOutlineInformationCircle className='text-text-muted' />
            </div>
            <p className='mb-4 pr-10 text-sm text-text-muted'>
              You earn points every time your memes are liked.
            </p>
            <Button variant='primaryOutline' className='font-medium'>
              Earn on Farcaster
            </Button>
          </Card>
          <Card className='relative flex flex-col bg-[#1D5AF70D]'>
            <GalxeLogo className='absolute right-2 top-2 text-4xl text-[#1D5AF7]' />
            <div className='mb-1 flex items-center gap-2'>
              <span className='font-semibold'>Galxe Quests</span>
              <HiOutlineInformationCircle className='text-text-muted' />
            </div>
            <p className='mb-4 pr-10 text-sm text-text-muted'>
              Earn points by completing tasks on Galxe.
            </p>
            <Button variant='primaryOutline' className='font-medium'>
              Earn on Galxe
            </Button>
          </Card>
        </div>
        <Card className='flex flex-col gap-1 bg-white'>
          <div className='mb-1 flex items-center gap-2'>
            <span className='font-semibold'>Earn With Friends</span>
            <HiOutlineInformationCircle className='text-text-muted' />
          </div>
          <p className='text-sm text-text-muted'>
            Earn points when your friends join Epic using your link.
          </p>
        </Card>
      </div>
    </div>
  )
}

function MainCard() {
  const isInitializedProxy = useMyAccount.use.isInitializedProxy()
  const address = useMyMainAddress()

  if (!isInitializedProxy) {
    return (
      <MainCardTemplate>
        <div className='flex w-full gap-4'>
          <Skeleton className='hidden h-28 w-28 rounded-lg border-[3px] border-white/20 bg-white/40 object-cover @lg:block' />
          <div className='flex flex-1 flex-col gap-1'>
            <div className='mb-2 flex items-center gap-3 @lg:mb-0'>
              <Skeleton className='h-9 w-9 rounded-lg border-[3px] border-white/20 object-cover @lg:hidden' />
              <Skeleton className='w-36 bg-white/40 text-lg font-semibold' />
            </div>
            <Skeleton className='relative flex h-auto flex-1 flex-col gap-1 rounded-xl bg-white/40 py-3' />
          </div>
        </div>
      </MainCardTemplate>
    )
  }

  if (!address) {
    return <GuestCard />
  }

  return <ProfileCard />
}

function ProfileCard() {
  const address = useMyMainAddress()

  return (
    <MainCardTemplate className='relative'>
      <div className='relative flex w-full flex-col gap-4'>
        <Button
          variant='transparent'
          className='absolute right-0 top-0 bg-white/10'
        >
          How does it work?
        </Button>
        <div className='flex w-full gap-4'>
          <Image
            src={DummyProfilePic}
            alt=''
            className='hidden w-28 rounded-lg border-[3px] border-white/20 object-cover @lg:block'
          />
          <div className='flex flex-1 flex-col gap-1'>
            <div className='mb-2 flex items-center gap-3 @lg:mb-0'>
              <Image
                src={DummyProfilePic}
                alt=''
                className='h-9 w-9 rounded-lg border-[3px] border-white/20 object-cover @lg:hidden'
              />
              <span className='text-lg font-semibold'>Vit</span>
            </div>
            <div className='relative flex flex-col gap-1 rounded-xl px-4 py-3'>
              <PointsBorder className='pointer-events-none absolute inset-0 h-full w-full' />
              <span
                className={cx(
                  'font-mono text-2xl font-bold @lg:text-3xl',
                  spaceMono.className
                )}
              >
                10,000 Points
              </span>
              <span className='text-sm'>
                +45 Points <span className='text-white/70'>yesterday</span>
              </span>
            </div>
          </div>
        </div>
        <div className='flex gap-3'>
          <Button className='flex items-center gap-2' variant='white'>
            <span>Share</span>
            <FiShare />
          </Button>
          <Button
            className='flex items-center gap-2 bg-white/10'
            variant='transparent'
          >
            <span>Rewards Details</span>
          </Button>
        </div>
      </div>
    </MainCardTemplate>
  )
}

function GuestCard() {
  return (
    <MainCardTemplate className='pt-3' illustClassName='-bottom-1/3'>
      <div className='mb-1 flex w-full items-center justify-between'>
        <span className='text-lg font-semibold'>Meme2earn</span>
        <Button variant='transparent' className='bg-white/10'>
          How does it work?
        </Button>
      </div>
      <p className='mb-4 max-w-96 font-medium'>
        Start monetizing your best memes, and earn when you like posts from
        others!
      </p>
      <Button variant='white'>Start earning</Button>
    </MainCardTemplate>
  )
}

function MainCardTemplate({
  illustClassName,
  ...props
}: CardProps & { illustClassName?: string }) {
  return (
    <Card
      {...props}
      className={cx(
        'relative flex flex-col items-start overflow-clip bg-background-primary text-white @container',
        props.className
      )}
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top right, #7996F9, #2756F5)',
        ...props.style,
      }}
    >
      {props.children}
      <EpicTokenIllust
        className={cx(
          'pointer-events-none absolute -bottom-1/4 right-0 h-full w-[125%] translate-x-[40%] @lg:-bottom-1/3',
          illustClassName
        )}
      />
    </Card>
  )
}
