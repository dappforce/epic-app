import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import Card, { CardProps } from '@/components/Card'
import FormatBalance from '@/components/FormatBalance'
import Name from '@/components/Name'
import { Skeleton } from '@/components/SkeletonFallback'
import PopOver from '@/components/floating/PopOver'
import { Pluralize } from '@/components/layouts/CreatorSidebar/RewardInfo'
import { CREATORS_CONSTANTS } from '@/components/layouts/CreatorSidebar/utils'
import { spaceMono } from '@/fonts'
import { getUserStatisticsQuery } from '@/services/datahub/leaderboard/query'
import { useSendEvent } from '@/stores/analytics'
import { useLoginModal } from '@/stores/login-modal'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx, mutedTextColorStyles } from '@/utils/class-names'
import BN from 'bignumber.js'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
import epicConfig from '../../../../constants/config/epic'
import MissingRewards from '../MissingRewards'
import LeaderboardSection from './LeaderboardSection'
import ReferralSection from './ReferralSection'
import useCalculateTokenRewards from './useCalculateTokenRewards'

const { gradient, tokenSymbol, EpicTokenIllust } = epicConfig

type MainContentProps = {
  className?: string
}

const MainContent = ({ className }: MainContentProps) => {
  const myAddress = useMyMainAddress()

  return (
    <div className={cx('pb-4', className)}>
      <div className={cx('flex flex-col gap-4 px-4 pt-4 lg:px-0')}>
        <MainCard />
        <MissingRewards />
        {myAddress && <ReferralSection />}
        <LeaderboardSection />
      </div>
    </div>
  )
}

function MainCard() {
  const isInitializedProxy = useMyAccount.use.isInitializedProxy()
  const myAddress = useMyMainAddress()

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

  if (!myAddress) {
    return <GuestCard />
  }

  return <ProfileCard />
}

const HowDoesItWork = () => (
  <Button
    variant='transparent'
    className='bg-white/10 !shadow-none !ring-0 hover:outline hover:outline-white'
    href='https://epicapp.net/what-is-meme2earn'
    target='_blank'
  >
    How does it work?
  </Button>
)

const ProfileCard = () => {
  const myAddress = useMyMainAddress()

  const userAddress = myAddress || ''

  const { isLoading, data: reward } = useCalculateTokenRewards({
    address: userAddress,
  })

  const { data: userStats, isLoading: isUserStatsLoading } =
    getUserStatisticsQuery.useQuery({
      address: userAddress,
    })

  const { creator, staker } = userStats || {}

  const creatorTotalPoints = creator?.earnedTotal || '0'
  const stakerTotalPoints = staker?.earnedTotal || '0'

  const totalPoints = new BN(creatorTotalPoints).plus(stakerTotalPoints)

  return (
    <MainCardTemplate
      bottomSection={
        <div className='flex items-center gap-1'>
          <span className={cx(mutedTextColorStyles, 'text-sm leading-[22px]')}>
            Total Points:
          </span>
          <span>
            <FormatBalance
              value={totalPoints.toString()}
              symbol={''}
              loading={isUserStatsLoading}
              className={cx('font-bold leading-[22px]')}
            />
          </span>
        </div>
        // <PopOver
        //   yOffset={6}
        //   panelSize='sm'
        //   placement='top'
        //   triggerClassName='w-fit'
        //   triggerOnHover
        //   trigger={
        //     <div className='flex items-center gap-2 '>
        //       <div className='flex items-center gap-1'>
        //         <span
        //           className={cx(mutedTextColorStyles, 'text-sm leading-[22px]')}
        //         >
        //           Total Points:
        //         </span>
        //         <span>
        //           <FormatBalance
        //             value={totalPoints.toString()}
        //             symbol={''}
        //             loading={isUserStatsLoading}
        //             className={cx('font-bold leading-[22px]')}
        //           />
        //         </span>
        //       </div>
        //       <HiOutlineInformationCircle
        //         className={cx('h-4 w-4 text-slate-400')}
        //       />
        //     </div>
        //   }
        // >
        //   <p>bla bla bla</p>
        // </PopOver>
      }
    >
      <div className='flex w-full flex-col gap-4'>
        <div className='flex w-full items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <AddressAvatar
              address={userAddress}
              className='h-[33px] w-[33px] rounded-lg object-cover outline outline-[3px] outline-white/20'
            />
            <Name
              address={userAddress}
              className='text-lg font-semibold !text-white'
            />
          </div>
          <HowDoesItWork />
        </div>
        <div className='flex flex-col gap-4'>
          <div className='relative flex flex-col gap-2 rounded-xl'>
            <span className='flex items-center gap-2'>
              <FormatBalance
                value={reward}
                symbol={''}
                loading={isLoading}
                className={cx(
                  'text-[26px] font-bold leading-none',
                  spaceMono.className
                )}
              />
              <span
                className={cx(
                  'text-[26px] font-bold leading-none',
                  spaceMono.className
                )}
              >{`${tokenSymbol}`}</span>
            </span>
            <span className='text-sm leading-none text-slate-200'>
              earned this week
            </span>
          </div>
          <PopOver
            yOffset={6}
            panelSize='sm'
            placement='top'
            triggerClassName='w-fit'
            triggerOnHover
            trigger={
              <div className='flex items-start gap-2 md:items-center '>
                <span className='text-sm leading-[22px] text-slate-200'>
                  Rewards distribution in{' '}
                  <span className='font-bold text-white'>
                    <Pluralize
                      count={CREATORS_CONSTANTS.getDistributionDaysLeft()}
                      singularText='day'
                      pluralText='days'
                    />
                  </span>
                </span>
                <span className='mt-[4px] md:mt-0'>
                  <HiOutlineInformationCircle className={cx('h-4 w-4')} />
                </span>
              </div>
            }
          >
            <p>
              The amount of time remaining until your bonus rewards for this
              week are deposited into your account
            </p>
          </PopOver>
        </div>
      </div>
    </MainCardTemplate>
  )
}

function GuestCard() {
  const sendEvent = useSendEvent()
  const setIsLoginModalOpen = useLoginModal.use.setIsOpen()

  return (
    <MainCardTemplate className='pt-3' illustClassName='-bottom-1/3'>
      <div className='mb-2 flex w-full items-center justify-between'>
        <span className='text-lg font-semibold'>Meme2earn</span>
        <HowDoesItWork />
      </div>
      <p className='mb-4 max-w-96 text-white/80'>
        Start monetizing your best memes, and earn when you like posts from
        others!
      </p>
      <Button
        variant='white'
        onClick={() => {
          sendEvent('login', { eventSource: 'start_earning' })
          setIsLoginModalOpen(true)
        }}
      >
        Start earning
      </Button>
    </MainCardTemplate>
  )
}

function MainCardTemplate({
  illustClassName,
  bottomSection,
  ...props
}: CardProps & { illustClassName?: string; bottomSection?: React.ReactNode }) {
  return (
    <div className='rounded-2xl bg-white'>
      <Card
        {...props}
        className={cx(
          'relative flex flex-col items-start overflow-clip bg-background-primary text-white @container',
          props.className
        )}
        style={{
          backgroundImage: gradient,
          ...props.style,
        }}
      >
        <EpicTokenIllust
          className={cx(
            'absolute -bottom-[54px] -right-[306px]',
            illustClassName
          )}
        />
        <div className='relative z-10 flex w-full flex-1 flex-col items-start'>
          {props.children}
        </div>
      </Card>
      {bottomSection && (
        <div className='rounded-2xl p-4 shadow-[0px_4px_9.8px_0px_rgba(203,213,225,0.20)]'>
          {bottomSection}
        </div>
      )}
    </div>
  )
}

export default MainContent
