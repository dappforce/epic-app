import Diamond from '@/assets/emojis/diamond.png'
import SkeletonFallback from '@/components/SkeletonFallback'
import SubsocialProfileModal from '@/components/profile/UpsertProfileModal'
import { useSendEvent } from '@/stores/analytics'
import { useMyMainAddress } from '@/stores/my-account'
import { formatNumber } from '@/utils/strings'
import Image from 'next/image'
import { useState } from 'react'
import LeaderboardModal from './LeaderboardModal'

type ReferrerStatsProps = {
  refCount: number
  pointsEarned: string
  isLoading?: boolean
}

const pointsPerUser = 200_000

const ReferrerStats = ({
  refCount,
  pointsEarned,
  isLoading,
}: ReferrerStatsProps) => {
  const [openProfileModal, setOpenProfileModal] = useState(false)
  const [openLeaderboard, setOpenLeaderboard] = useState(false)
  const myAddress = useMyMainAddress()
  const sendEvent = useSendEvent()

  return (
    <>
      <div className='flex w-full flex-col rounded-xl bg-slate-800 hover:cursor-pointer'>
        <div className='flex w-full items-center gap-4 px-4'>
          <div className='flex w-full flex-col gap-1 border-r border-slate-700 py-4'>
            <SkeletonFallback isLoading={isLoading} className='w-8'>
              <span className='flex items-center gap-2 text-2xl font-bold'>
                <Image src={Diamond} alt='' className='h-8 w-8' />
                {formatNumber(refCount * pointsPerUser, { shorten: true })}
              </span>
            </SkeletonFallback>
            <span className='text-sm font-medium text-slate-400'>
              Points earned from {refCount} invited friends
            </span>
          </div>
          <div className='flex w-full flex-col gap-1 py-4'>
            <SkeletonFallback isLoading={isLoading} className='w-8'>
              <span className='flex items-center gap-2 text-2xl font-bold'>
                <Image src={Diamond} alt='' className='h-8 w-8' />
                {formatNumber(pointsEarned, { shorten: true })}
              </span>
            </SkeletonFallback>
            <span className='text-sm font-medium text-slate-400'>
              Points earned from your friends activity
            </span>
          </div>
        </div>
      </div>
      <SubsocialProfileModal
        title='✏️ Edit Profile'
        closeModal={() => setOpenProfileModal(false)}
        isOpen={openProfileModal}
      />
      <LeaderboardModal
        isOpen={openLeaderboard}
        close={() => setOpenLeaderboard(false)}
      />
    </>
  )
}

export default ReferrerStats
