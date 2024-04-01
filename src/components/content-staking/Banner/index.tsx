import LinkText from '@/components/LinkText'
import SkeletonFallback from '@/components/SkeletonFallback'
import useGetTheme from '@/hooks/useGetTheme'
import BgGradient from '@/modules/LandingPage/common/BgGradient'
import { useSendEvent } from '@/stores/analytics'
import { cx } from '@/utils/class-names'
import { useEffect, useState } from 'react'
import { useContentStakingContext } from '../utils/ContentStakingContext'
import SectionWrapper from '../utils/SectionWrapper'
import { mutedTextColorStyles } from '../utils/commonStyles'
import BannerActionButtons from './BannerActionButtons'
import StatsCards from './StakerDashboard'
import StakingStepper from './StakingStepper'

const BannerSection = () => {
  const { isLockedTokens, ledgerLoading } = useContentStakingContext()
  const theme = useGetTheme()
  const [showBgGradient, setShowBgGradient] = useState(false)
  const sendEvent = useSendEvent()

  useEffect(() => {
    setShowBgGradient(theme === 'dark')
  }, [theme])

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex w-full flex-col gap-3'>
        <div className='flex items-center justify-between gap-2'>
          <div className='font-unbounded text-2xl font-extrabold leading-none text-text md:text-[32px]'>
            Content Staking
          </div>
        </div>
        <div
          className={cx(
            'text-base font-normal leading-6 md:text-xl md:leading-8',
            mutedTextColorStyles
          )}
        >
          Content Staking allows SUB token holders to earn SUB by actively
          engaging with good content on the network.{' '}
          <LinkText
            variant='primary'
            className='hover:no-underline'
            target='_blank'
            onClick={() => sendEvent('cs_how_it_works')}
            href={
              'https://docs.subsocial.network/docs/basics/content-staking/content-staking/'
            }
          >
            How does it work?
          </LinkText>
        </div>
      </div>
      <SectionWrapper className='relative z-[1] flex flex-col items-center gap-5 p-4 md:gap-7'>
        {showBgGradient && (
          <BgGradient
            color='dark-blue'
            className='absolute left-[80px] top-[55px] z-0 h-[731px] w-[731px] -translate-x-full'
          />
        )}

        <SkeletonFallback
          className='h-[248px] w-full rounded-2xl md:h-[181px]'
          isLoading={ledgerLoading}
        >
          {isLockedTokens ? <StatsCards /> : <StakingStepper />}
          <div>
            <BannerActionButtons />
          </div>
        </SkeletonFallback>
      </SectionWrapper>
    </div>
  )
}

export default BannerSection
