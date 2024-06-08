import Diamond from '@/assets/emojis/diamond.png'
import Laugh from '@/assets/emojis/laugh.png'
import Pointup from '@/assets/emojis/pointup.png'
import Speaker from '@/assets/emojis/speaker.png'
import Thumbsup from '@/assets/emojis/thumbsup.png'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { Skeleton } from '@/components/SkeletonFallback'
import { getTodaySuperLikeCountQuery } from '@/services/datahub/content-staking/query'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { useSendEvent } from '@/stores/analytics'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { formatNumber } from '@/utils/strings'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ComponentProps } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { HiChevronRight, HiXMark } from 'react-icons/hi2'
import SlotCounter from 'react-slot-counter'
import { Drawer } from 'vaul'

export default function PointsWidget(
  props: ComponentProps<'div'> & { isNoTgScroll?: boolean }
) {
  const sendEvent = useSendEvent()

  return (
    <Drawer.Root
      shouldScaleBackground
      direction='top'
      onOpenChange={(open) => {
        // To make bottom menu still clickable when this drawer is open
        setTimeout(() => {
          if (open) {
            document.body.style.pointerEvents = ''
          } else if (props.isNoTgScroll) {
            document.body.style.paddingTop = '500px'
          }
        }, 0)
      }}
    >
      <Drawer.Trigger asChild>
        <div
          {...props}
          className={cx(
            'z-10 flex w-full cursor-pointer items-center justify-between rounded-b-2xl bg-black/50 px-4.5 py-3 backdrop-blur-xl',
            props.className
          )}
          onClick={() => {
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
          <div className='flex items-center gap-2'>
            <Image className='h-7 w-7' src={Diamond} alt='' />
            <span className='flex items-center text-xl font-bold'>
              <Points />
            </span>
            <FaChevronDown className='relative top-0.5' />
          </div>
        </div>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className='fixed inset-0 z-10 h-full w-full bg-black/50 backdrop-blur-lg' />
        <Drawer.Content className='fixed inset-0 z-10 flex h-full w-full flex-col rounded-t-[10px] bg-transparent pb-20 outline-none'>
          <Drawer.Close className='absolute right-4 top-4'>
            <HiXMark className='text-3xl' />
          </Drawer.Close>
          <div className='mx-auto flex h-full w-full max-w-screen-md flex-col items-center overflow-auto px-4 pt-24'>
            <div className='mb-16 flex flex-col gap-2'>
              <div className='mr-3 flex items-center justify-center gap-3'>
                <Image src={Diamond} alt='' className='h-14 w-14' />
                <span className='flex items-center text-4xl font-bold'>
                  <Points />
                </span>
              </div>
              <div className='flex justify-center'>
                <Button
                  href='/guide'
                  className='bg-[#6395FD]/10 px-5 py-2 text-text'
                >
                  How it works
                </Button>
              </div>
            </div>
            <div className='flex w-full flex-1 flex-col gap-4 pb-8'>
              <span className='text-center text-lg font-bold text-text-muted'>
                How to earn Points:
              </span>
              <LinkWrapper href='/tg/memes'>
                <Card className='flex w-full items-center gap-4 bg-background-light'>
                  <Image
                    src={Laugh}
                    alt=''
                    className='h-14 w-14 flex-shrink-0'
                  />
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold'>Meme2Earn</span>
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
              <LinkWrapper href='/tg/friends'>
                <Card className='flex w-full items-center gap-4 bg-background-light'>
                  <Image
                    src={Speaker}
                    alt=''
                    className='h-14 w-14 flex-shrink-0'
                  />
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold'>Invite2Earn</span>
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
              <LinkWrapper href='/tg'>
                <Card className='flex w-full items-center gap-4 bg-background-light'>
                  <Image
                    src={Pointup}
                    alt=''
                    className='h-14 w-14 flex-shrink-0'
                  />
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold'>Tap2Earn</span>
                      <div className='rounded-full bg-background px-2 py-0.5 text-sm text-text-muted'>
                        Soon
                      </div>
                    </div>
                    <p className='text-sm text-text-muted'>
                      Tap on the laughing emoji and earn Points.
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function LinkWrapper({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
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
    return <Drawer.Close asChild>{link}</Drawer.Close>
  }
  return link
}

function LikeCount({ shorten }: { shorten?: boolean }) {
  const isInitializedProxy = useMyAccount.use.isInitializedProxy()
  const myAddress = useMyMainAddress()
  const { data, isLoading } = getTodaySuperLikeCountQuery.useQuery(
    myAddress ?? ''
  )

  if ((isLoading && myAddress) || !isInitializedProxy) {
    return (
      <Skeleton className='relative -top-0.5 inline-block w-12 align-middle' />
    )
  }

  return <span>{formatNumber(data?.count ?? '0', { shorten })}</span>
}

function Points({ shorten }: { shorten?: boolean }) {
  const isInitializedProxy = useMyAccount.use.isInitializedProxy()
  const myAddress = useMyMainAddress()
  const { data, isLoading } = getBalanceQuery.useQuery(myAddress || '')

  if ((isLoading && myAddress) || !isInitializedProxy) {
    return <Skeleton className='inline-block w-12' />
  }

  const formatted = formatNumber(data ?? '0', { shorten })

  return (
    <SlotCounter
      containerClassName='relative -top-0.5'
      value={formatted.split('')}
      animateOnVisible={false}
      sequentialAnimationMode
      startValue={formatted.split('')}
      startValueOnce
    />
  )
}
