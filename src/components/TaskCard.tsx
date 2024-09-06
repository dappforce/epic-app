import Diamond from '@/assets/emojis/diamond.png'
import Check from '@/assets/icons/check.svg'
import Card from '@/components/Card'
import { Skeleton } from '@/components/SkeletonFallback'
import { cx } from '@/utils/class-names'
import { formatNumber } from '@/utils/strings'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'
import { CSSProperties } from 'react'
import { FaChevronRight } from 'react-icons/fa6'

export default function TaskCard({
  completed,
  image,
  reward,
  title,
  customAction,
  onClick,
  href,
  openInNewTab,
  isLoadingReward,
  withoutDiamondIcon,
  topBanner,
}: {
  image: ImageProps['src']
  title: React.ReactNode
  reward: number | string
  completed: boolean
  customAction?: React.ReactNode
  onClick?: () => void
  href?: string
  openInNewTab?: boolean
  isLoadingReward?: boolean
  withoutDiamondIcon?: boolean
  topBanner?: {
    icon: JSX.Element
    text: string
    className?: string
    textStyle?: CSSProperties
    textClassName?: string
  }
}) {
  const card = (
    <Card className='flex cursor-pointer flex-col overflow-clip rounded-2xl p-0'>
      {topBanner && (
        <div className='bg-background'>
          <div
            className={cx(
              'flex items-center justify-center gap-1 py-1.5 text-xs',
              topBanner.className
            )}
          >
            <span className='text-sm'>{topBanner.icon}</span>
            <span
              className={cx('font-medium', topBanner.textClassName)}
              style={topBanner.textStyle}
            >
              {topBanner.text}
            </span>
          </div>
        </div>
      )}
      <div
        className='flex items-center gap-2.5 bg-background-light p-2.5 transition active:bg-background-lighter'
        onClick={onClick}
      >
        <Image src={image} alt='' className='h-14 w-14' />
        <div className='flex flex-col gap-1'>
          <span className='font-bold'>{title}</span>
          <div className='flex items-center gap-0.5'>
            {!withoutDiamondIcon && (
              <Image src={Diamond} alt='' className='relative top-px h-5 w-5' />
            )}
            {isLoadingReward ? (
              <Skeleton className='w-12' />
            ) : (
              <span className='text-text-muted'>
                {typeof reward === 'number'
                  ? `+${formatNumber(reward)}`
                  : reward}
              </span>
            )}
          </div>
        </div>
        <div className='ml-auto flex items-center justify-center pr-1'>
          {completed ? (
            <Check />
          ) : customAction ? (
            customAction
          ) : (
            <FaChevronRight className='text-text-muted' />
          )}
        </div>
      </div>
    </Card>
  )
  if (href) {
    return (
      <Link target={openInNewTab ? '_blank' : undefined} href={href}>
        {card}
      </Link>
    )
  }
  return card
}
