import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import LinkText from '@/components/LinkText'
import Name from '@/components/Name'
import { getReferralLeaderboardQuery } from '@/services/datahub/referral/query'
import { isDef } from '@subsocial/utils'
import { useState } from 'react'
import LeaderboardModal from '../FriendsPage/LeaderboardModal'

const HomePageContestPreview = () => {
  const { data: referrersData } = getReferralLeaderboardQuery(true).useQuery({})
  const [isOpen, setIsOpen] = useState(false)

  const { leaderboardData: items } = referrersData || {}

  const data = items?.filter(isDef).slice(0, 3) || []

  return (
    <>
      <div className='flex flex-col gap-4 px-4'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-lg font-bold'>Contest Winners</span>
          <LinkText variant='primary' onClick={() => setIsOpen(true)}>
            See all
          </LinkText>
        </div>
        <div className='flex flex-col gap-2'>
          {data.map((item, index) => {
            if (!item) return null

            return (
              <ContestPreviewItem
                key={index}
                item={item}
                withDivider={data.length !== index + 1}
              />
            )
          })}
        </div>
        <Button variant={'primary'} size={'md'} href='/tg/friends'>
          Invite frends and earn $
        </Button>
      </div>
      <LeaderboardModal isOpen={isOpen} close={() => setIsOpen(false)} />
    </>
  )
}

type ContestPreviewItemProps = {
  item: {
    address: string
    count: number
    rank: number
  }
  withDivider?: boolean
}

const ContestPreviewItem = ({ item, withDivider }: ContestPreviewItemProps) => {
  const { address, count, rank } = item

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <AddressAvatar address={address} className='h-[38px] w-[38px]' />
          <div className='flex flex-col gap-2'>
            <Name address={address} className='leading-none' />
            <span className='text-sm font-medium leading-none text-slate-400'>
              Invited {count} frens
            </span>
          </div>
        </div>
        <span className='text-slate-400'>{rank + 1}</span>
      </div>
      {withDivider && (
        <div className='ml-[46px] border-b border-slate-700'></div>
      )}
    </div>
  )
}

export default HomePageContestPreview
