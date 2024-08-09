import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import LinkText from '@/components/LinkText'
import Name from '@/components/Name'
import { getReferralLeaderboardQuery } from '@/services/datahub/referral/query'
import { isDef } from '@subsocial/utils'

const ContestPreview = () => {
  const { data: referrersData, isLoading } = getReferralLeaderboardQuery(
    true
  ).useQuery({})

  const { leaderboardData: items } = referrersData || {}

  const data = items?.filter(isDef).slice(0, 3) || []

  console.log(data)

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-lg font-bold'>Contest Winners</span>
        <LinkText variant='primary' href='/tg/friends'>
          See all (10)
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
  const { address, count } = item

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
        <div className='flex flex-col gap-2'>
          <span className='text-right text-xs leading-none text-slate-400'>
            Earned:
          </span>
          <span className='text-sm font-medium leading-none text-green-400'>
            20 USD
          </span>
        </div>
      </div>
      {withDivider && (
        <div className='ml-[46px] border-b border-slate-700'></div>
      )}
    </div>
  )
}

export default ContestPreview
