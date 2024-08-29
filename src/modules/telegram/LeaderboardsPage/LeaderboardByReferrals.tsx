import Loading from '@/components/Loading'
import { getReferralLeaderboardQuery } from '@/services/datahub/referral/query'
import { isDef } from '@subsocial/utils'
import { useState } from 'react'
import LeaderboardModal from '../FriendsPage/LeaderboardModal'
import { LeaderboardNoData } from '../StatsPage/LeaderboardTable'
import LeaderboardPreviewItem from './LeaderboardPreveiwItem'

const LeaderboardByReferrals = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: referrersData, isLoading } = getReferralLeaderboardQuery(
    true
  ).useQuery({})

  const { leaderboardData: items } = referrersData || {}

  const data = items?.filter(isDef).slice(0, 3) || []

  return (
    <>
      <div className='flex flex-col gap-4 overflow-hidden rounded-2xl bg-slate-800 p-4 pb-0'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-lg font-semibold'>
            👋 July Referrers Contest
          </span>
          <span className='font-semibold'>🏁 Finished</span>
        </div>
        <div className='flex flex-col gap-2'>
          {data?.length === 0 &&
            (isLoading ? (
              <Loading title='Loading table data' className='p-7' />
            ) : (
              <LeaderboardNoData />
            ))}
          {data?.map((item, i) => {
            const { address, count, rank } = item

            return (
              <LeaderboardPreviewItem
                key={i}
                address={address}
                showDivider={i !== data.length - 1}
                desc={
                  <span className='text-sm font-medium leading-none text-slate-400'>
                    Invited {count} frens
                  </span>
                }
                value={<span className='text-slate-400'>{rank + 1}</span>}
              />
            )
          })}
          {data?.length > 0 && (
            <div>
              <div className='-mx-[40px] border-t border-slate-700'></div>
              <div
                onClick={() => setIsOpen(true)}
                className='flex cursor-pointer items-center justify-center  p-4 leading-none text-text-primary'
              >
                See all participants
              </div>
            </div>
          )}
        </div>
      </div>
      <LeaderboardModal isOpen={isOpen} close={() => setIsOpen(false)} />
    </>
  )
}

export default LeaderboardByReferrals
