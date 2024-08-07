import Card from '@/components/Card'
import SkeletonFallback from '@/components/SkeletonFallback'
import { Column, TableRow } from '@/components/Table'
import { cx } from '@/utils/class-names'
import { isEmptyArray } from '@subsocial/utils'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { UserPreview } from '../StatsPage/LeaderboardTable'

export const tableColumns = (): Column[] => [
  {
    index: 'user',
    align: 'left',
    className: cx('p-0 py-2 pr-2'),
  },
  {
    index: 'id',
    align: 'right',
    className: cx('p-0 py-2 pl-2 w-[15%] text-slate-400 '),
  },
]

type ReferralTableProps = {
  referrals?: {
    timestamp: string
    socialProfileId: string
  }[]
  isLoading?: boolean
  refCount: number
}

const ReferralTable = ({
  referrals,
  isLoading,
  refCount,
}: ReferralTableProps) => {
  const data = useMemo(() => {
    return (
      referrals?.map((item, i) => ({
        id: i + 1,
        user: (
          <UserPreview
            address={item.socialProfileId}
            nameClassName='[&>span]:overflow-hidden [&>span]:whitespace-nowrap [&>span]:text-ellipsis'
            desc={
              <span className='text-sm text-slate-400'>
                {dayjs(item.timestamp).format('DD MMM')}
              </span>
            }
          />
        ),
      })) || []
    )
  }, [referrals])

  if (!data || isEmptyArray(data)) return null

  return (
    <Card className='flex flex-col gap-4 bg-background-light px-4'>
      <div className='flex flex-col gap-4'>
        <span className='flex items-center gap-2 text-lg font-semibold'>
          <SkeletonFallback isLoading={isLoading} className='w-8'>
            {refCount}
          </SkeletonFallback>{' '}
          referrals
        </span>
        <div className='flex w-full flex-col'>
          <table className='w-full table-fixed text-left'>
            <tbody>
              {data.map((item, i) => {
                return (
                  <TableRow
                    key={i}
                    columns={tableColumns()}
                    item={item}
                    withDivider={false}
                  />
                )
              })}
            </tbody>
          </table>
          {refCount && refCount > 100 && (
            <div className='flex items-center gap-2 py-2'>
              <span className='w-full border border-slate-600'></span>
              <span className='min-w-max text-sm font-medium text-slate-400'>
                AND {refCount - 100} MORE MEMBERS
              </span>
              <span className='w-full border border-slate-600'></span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ReferralTable
