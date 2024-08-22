import BlueGradient from '@/assets/graphics/blue-gradient.png'
import PremiumFeaturesImage from '@/assets/graphics/premium-features/premium-features-image.svg'
import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import ComingSoonModal from '@/components/modals/ComingSoonModal'
import Image from 'next/image'
import { useState } from 'react'
import { MdOutlineKeyboardArrowRight } from 'react-icons/md'

const premiumFeatures = [
  {
    title: 'More Daily Likes',
    icon: '👍',
    description:
      'Get more daily likes to support memes you love and earn more Points.',
  },
  {
    title: 'Boost Your Memes',
    icon: '🚀',
    description: 'Ensure your memes are seen by more people every day.',
  },
  {
    title: 'Advertise Your Project',
    icon: '📢',
    description:
      'Turn your project into a meme and reach a wider audience in the feed.',
  },
  {
    title: 'Host Contests',
    icon: '🏆',
    description:
      'Organize contests to engage the community and create buzz around.',
  },
]

export default function PremiumFeaturesPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <LayoutWithBottomNavigation
      withFixedHeight
      className='relative'
      pageNavigation={{ title: 'Airdrop', backLink: '/tg/menu' }}
    >
      <Image
        src={BlueGradient}
        priority
        alt=''
        className='absolute -top-[0] left-1/2 z-0 w-full -translate-x-1/2'
      />
      <div className='z-10 flex flex-1 flex-col gap-4 overflow-auto'>
        <BackButton
          title='Premium Features'
          backPath='/tg/menu'
          className='mt-4 px-4'
        />
        <div className='flex flex-col gap-6 px-4'>
          <div className='flex w-full flex-col items-center gap-4'>
            <PremiumFeaturesImage />
            <span className='text-center text-slate-400'>
              Unlock exclusive features to earn more points and promote your
              content or channel.
            </span>
          </div>
          <div className='flex flex-col gap-[14px]'>
            {premiumFeatures.map((item, i) => (
              <PremiumFeature
                {...item}
                key={i}
                onClick={() => setIsOpen(true)}
              />
            ))}
          </div>
        </div>
        <ComingSoonModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </LayoutWithBottomNavigation>
  )
}

type PremiumFeatureProps = {
  title: string
  icon: string
  description: string
  onClick?: () => void
}

const PremiumFeature = ({
  icon,
  title,
  description,
  onClick,
}: PremiumFeatureProps) => {
  return (
    <div
      className='flex cursor-pointer items-center gap-[9px] rounded-[20px] bg-slate-800 px-[10px] py-[14px]'
      onClick={onClick}
    >
      <span className='text-[43px]'>{icon}</span>
      <div className='flex flex-1 flex-col gap-2'>
        <span className='text-base font-medium leading-none'>{title}</span>
        <span className='text-sm text-slate-400'>{description}</span>
      </div>
      <MdOutlineKeyboardArrowRight className='text-[25px] text-slate-500' />
    </div>
  )
}
