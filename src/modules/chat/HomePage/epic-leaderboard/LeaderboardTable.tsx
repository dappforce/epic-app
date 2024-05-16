import MedalsImage from '@/assets/graphics/medals.png'
import AddressAvatar from '@/components/AddressAvatar'
import FormatBalance from '@/components/FormatBalance'
import LinkText from '@/components/LinkText'
import Loading from '@/components/Loading'
import Name from '@/components/Name'
import Table, { Column } from '@/components/Table'
import { spaceGrotesk } from '@/fonts'
import { getLeaderboardDataQuery } from '@/services/datahub/leaderboard/query'
import { LeaderboardRole } from '@/services/datahub/leaderboard/types'
import { getProfileQuery } from '@/services/datahub/profiles/query'
import { cx, mutedTextColorStyles } from '@/utils/class-names'
import { isEmptyArray } from '@subsocial/utils'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import epicConfig from '../../../../constants/config/epic'
import LeaderboardModal from './LeaderboardModal'
import useCalculateTokenRewards from './useCalculateTokenRewards'

const TABLE_LIMIT = 10

const { tokenSymbol } = epicConfig

export const leaderboardColumns = (
  customColumnsClassNames?: (string | undefined)[]
): Column[] => [
  {
    index: 'rank',
    name: '#',
    className: cx(
      'p-0 py-2 pl-4 w-[45px]',
      mutedTextColorStyles,
      customColumnsClassNames?.[0]
    ),
  },
  {
    index: 'user-role',
    name: 'User',
    align: 'left',
    className: cx('p-0 py-2', customColumnsClassNames?.[1]),
  },
  {
    index: 'rewards',
    name: '$' + tokenSymbol,
    align: 'right',
    className: cx(
      'p-0 py-2 pr-4 md:w-[20%] w-[38%]',
      customColumnsClassNames?.[2]
    ),
  },
]

type LeaderboardTableProps = {
  role: LeaderboardRole
  currentUserRank?: {
    address: string
    rank: number | null
    reward: string
  }
  customColumnsClassNames?: (string | undefined)[]
}

const parseTableRows = (
  data: {
    address: string
    rank: number | null
    reward: string
  }[],
  limit: number,
  role: LeaderboardRole,
  address?: string
) => {
  return (
    data
      .map((item) => ({
        address: item.address,
        rank: item.rank!,
        'user-role': <UserPreview address={item.address} />,
        rewards: (
          <UserReward reward={item.reward} address={item.address} role={role} />
        ),
        className:
          item.address === address ? 'dark:bg-slate-700 bg-[#EEF2FF]' : '',
      }))
      .slice(0, limit) || []
  )
}

const LeaderboardTable = ({
  role,
  currentUserRank,
  customColumnsClassNames,
}: LeaderboardTableProps) => {
  const [openModal, setOpenModal] = useState(false)
  const router = useRouter()

  const { data: leaderboardData, isLoading } =
    getLeaderboardDataQuery.useInfiniteQuery(role)

  const data = useMemo(() => {
    if (!currentUserRank || (currentUserRank.rank ?? 0) < TABLE_LIMIT) {
      return parseTableRows(
        leaderboardData?.pages[0].data || [],
        TABLE_LIMIT,
        role,
        currentUserRank?.address
      )
    }

    return [
      {
        address: currentUserRank.address,
        rank: currentUserRank.rank!,
        'user-role': <UserPreview address={currentUserRank.address} />,
        rewards: (
          <UserReward
            reward={currentUserRank.reward}
            address={currentUserRank.address}
            role={role}
          />
        ),
        className: 'dark:bg-slate-700 bg-[#EEF2FF]',
      },
      ...parseTableRows(
        leaderboardData?.pages[0].data || [],
        TABLE_LIMIT - 1,
        role
      ),
    ]
  }, [JSON.stringify(currentUserRank), role, leaderboardData?.pages[0]])

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
              {role === 'creator'
                ? 'Create great content and get the most likes to show up here!'
                : 'Like the most posts to reach the top!'}
            </span>
          </div>
        ))}
      {!isEmptyArray(data) && (
        <div className='my-4 flex w-full flex-col'>
          <Table
            columns={leaderboardColumns(customColumnsClassNames)}
            data={data}
            className='rounded-none !bg-transparent dark:!bg-transparent [&>table]:table-fixed'
            headerClassName='!bg-transparent dark:!bg-transparent'
            rowsClassName='first:[&>td]:rounded-s-xl last:[&>td]:rounded-e-xl'
            withDivider={false}
            onRowClick={(item) =>
              router.replace('/[address]', `/${item.address}`)
            }
          />
          <LinkText
            className='mt-3 w-full text-center hover:no-underline'
            onClick={() => setOpenModal(true)}
            variant={'primary'}
          >
            View more
          </LinkText>
        </div>
      )}

      <LeaderboardModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        role={role}
        currentUserAddress={currentUserRank?.address}
      />
    </>
  )
}

type UserRewardProps = {
  reward: string
  address: string
  role: LeaderboardRole
}

export const UserReward = ({ reward, address, role }: UserRewardProps) => {
  const { data, isLoading } = useCalculateTokenRewards(address, role)

  return (
    <FormatBalance
      value={data}
      symbol={''}
      defaultMaximumFractionDigits={2}
      loading={isLoading}
      className={cx('font-medium', spaceGrotesk.className)}
    />
  )
}

type UserPreviewProps = {
  address: string
}

export const UserPreview = ({ address }: UserPreviewProps) => {
  const { data: profile } = getProfileQuery.useQuery(address)

  const about = profile?.profileSpace?.content?.about

  return (
    <div className='flex items-center gap-2'>
      <AddressAvatar address={address} className='h-[38px] w-[38px]' />
      <div className='flex flex-col gap-2'>
        <Name
          address={address}
          className='text-sm font-medium leading-none !text-text'
        />
        {about && (
          <div
            className={cx(
              'overflow-hidden overflow-ellipsis whitespace-nowrap text-xs leading-none',
              mutedTextColorStyles
            )}
          >
            {about}
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardTable