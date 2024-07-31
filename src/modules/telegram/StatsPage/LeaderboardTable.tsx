import Diamond from '@/assets/graphics/creators/diamonds/diamond.png'
import MedalsImage from '@/assets/graphics/medals.png'
import AddressAvatar from '@/components/AddressAvatar'
import FormatBalance from '@/components/FormatBalance'
import Loading from '@/components/Loading'
import Name from '@/components/Name'
import { Column, TableRow } from '@/components/Table'
import {
  leaderboardDataQueryByPeriod,
  userDataQueryByPeriod,
} from '@/services/datahub/leaderboard/query'
import { LeaderboardDataPeriod } from '@/services/datahub/leaderboard/types'
import { useMyMainAddress } from '@/stores/my-account'
import { useProfilePostsModal } from '@/stores/profile-posts-modal'
import { cx, mutedTextColorStyles } from '@/utils/class-names'
import Image, { ImageProps } from 'next/image'
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'

const TABLE_LIMIT = 100

export const leaderboardColumns = (): Column[] => [
  {
    index: 'user-role',
    align: 'left',
    className: cx('p-0 py-2 pl-2 w-[85%] '),
  },
  {
    index: 'rank',
    align: 'right',
    className: cx('p-0 py-2 pr-2'),
  },
]

type LeaderboardTableProps = {
  period: LeaderboardDataPeriod
  currentUserRank?: {
    address: string
    rank: number | null
    reward: string
  }
  customColumnsClassNames?: (string | undefined)[]
  refetchTab: { [key in LeaderboardDataPeriod]: boolean }
  setRefetchTab: Dispatch<
    SetStateAction<{
      allTime: boolean
      week: boolean
    }>
  >
}

type Data = {
  address: string
  rank: number | null
  reward: string
}

const parseTableRows = (data: Data[], limit: number, currentUserRank: Data) => {
  return (
    data
      .map((item) => ({
        address: item.address,
        rank: item.rank!,
        'user-role': (
          <UserPreview
            address={item.address}
            desc={<UserReward reward={item.reward} />}
          />
        ),
        className:
          item.address === currentUserRank?.address ? 'bg-slate-800' : '',
      }))
      .slice(0, limit) || []
  )
}

const LeaderboardTable = ({
  period,
  refetchTab,
  setRefetchTab,
}: LeaderboardTableProps) => {
  const myAddress = useMyMainAddress()
  const { openModal } = useProfilePostsModal()

  const { data: leaderboardDataResult, isLoading } =
    leaderboardDataQueryByPeriod[period].useQuery(period, {
      refetchOnMount: refetchTab[period] ? 'always' : false,
    })

  const { leaderboardData, totalCount } = leaderboardDataResult || {}

  const { data: userStats } = userDataQueryByPeriod[period].useQuery(
    myAddress || '',
    { refetchOnMount: refetchTab[period] ? 'always' : false }
  )

  useEffect(() => {
    const refetchTabByPeriod = refetchTab[period]

    if (refetchTabByPeriod) {
      setRefetchTab((prev) => ({ ...prev, [period]: false }))
    }
  }, [period, refetchTab, setRefetchTab])

  const data = useMemo(() => {
    const currentUserRankItem = userStats?.rank
      ? {
          address: userStats.address,
          rank: userStats.rank!,
          'user-role': (
            <UserPreview
              loading='eager'
              address={userStats.address}
              desc={<UserReward reward={userStats.reward} />}
            />
          ),
          className: cx('bg-slate-800 sticky bottom-0 z-[11]'),
        }
      : undefined

    return [
      ...parseTableRows(leaderboardData || [], TABLE_LIMIT, userStats),
      currentUserRankItem,
    ].filter(Boolean)
  }, [userStats, leaderboardData])

  return (
    <>
      {data.length === 0 &&
        (isLoading ? (
          <Loading title='Loading table data' className='p-7' />
        ) : (
          <div
            className='flex flex-col items-center justify-center p-4 text-center'
            style={{ gridColumn: '1/4' }}
          >
            <Image
              src={MedalsImage}
              alt=''
              className='relative w-[70px] max-w-sm'
            />
            <span className={cx(mutedTextColorStyles)}>
              Create great content and get the most likes to show up here!
            </span>
          </div>
        ))}
      {!!data.length && (
        <div className='flex w-full flex-col'>
          <table className='w-full table-fixed text-left'>
            <tbody>
              {data.map((item, i) => {
                return (
                  <TableRow
                    key={i}
                    columns={leaderboardColumns()}
                    onRowClick={(item) => {
                      openModal({ address: item.address })
                    }}
                    item={item}
                    withDivider={false}
                    className='first:[&>td]:rounded-s-xl last:[&>td]:rounded-e-xl'
                  />
                )
              })}
            </tbody>
          </table>
          {totalCount && totalCount > 100 && (
            <div className='flex items-center gap-2 py-2'>
              <span className='w-full border border-slate-600'></span>
              <span className='min-w-max text-sm font-medium text-slate-400'>
                AND {totalCount - 100} MORE MEMBERS
              </span>
              <span className='w-full border border-slate-600'></span>
            </div>
          )}
        </div>
      )}
    </>
  )
}

type UserRewardProps = {
  reward: string
}

export const UserReward = ({ reward }: UserRewardProps) => {
  return (
    <div className='flex items-center gap-1'>
      <Image src={Diamond} alt='' className='h-[14px] w-[14px]' />
      <FormatBalance
        value={reward}
        symbol={''}
        defaultMaximumFractionDigits={2}
        loading={false}
        className={cx('font-medium', mutedTextColorStyles)}
      />
    </div>
  )
}

type UserPreviewProps = {
  address: string
  desc?: React.ReactNode
  className?: string
  nameClassName?: string
}

export const UserPreview = ({
  address,
  desc,
  loading,
  className,
  nameClassName,
}: UserPreviewProps & { loading?: ImageProps['loading'] }) => {
  return (
    <div className={cx('flex items-center gap-2', className)}>
      <AddressAvatar
        address={address}
        className='h-[38px] w-[38px]'
        loading={loading}
      />
      <div className={cx('flex flex-col gap-2')}>
        <Name
          address={address}
          className={cx(
            'text-sm font-medium leading-none !text-text',
            nameClassName
          )}
        />
        {desc && (
          <div
            className={cx(
              'overflow-hidden overflow-ellipsis whitespace-nowrap text-xs leading-none'
            )}
          >
            {desc}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardTable
