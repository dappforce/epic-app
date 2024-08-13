import Button from '@/components/Button'
import { Skeleton } from '@/components/SkeletonFallback'
import Tabs from '@/components/Tabs'
import { getPostQuery } from '@/services/api/query'
import { getModeratedByModerator } from '@/services/datahub/moderation/query'
import { useIsAnyQueriesLoading } from '@/subsocial-query'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { AiOutlineReload } from 'react-icons/ai'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'
import ModerationMemeItem from './ModerationMemeItem'

const limit = 8

function useModeratorSearchParams() {
  const searchParams = useSearchParams()
  const status = searchParams?.get('status') as 'approved' | 'blocked'
  const page = searchParams?.get('page')
    ? parseInt(searchParams.get('page') as string) || 1
    : 1
  const offset = (page - 1) * limit

  return { status, page, offset }
}

function useModeratedResourceQuery({ moderator }: { moderator: string }) {
  const { offset, status } = useModeratorSearchParams()

  return getModeratedByModerator.useQuery({
    address: moderator,
    status,
    limit,
    offset,
  })
}

export default function ModeratedContentByModerator({
  moderator,
  chatId,
  hubId,
}: {
  moderator: string
  hubId: string
  chatId: string
}) {
  const { status } = useModeratorSearchParams()
  const { isFetching, refetch, data } = useModeratedResourceQuery({ moderator })

  const postQueries = getPostQuery.useQueries(data?.ids ?? [])
  const isAnyLoading = useIsAnyQueriesLoading(postQueries)

  return (
    <div className='flex h-full flex-col gap-2'>
      <Actions moderator={moderator} />

      {data?.total === 0 && (
        <div className='flex w-fit self-center rounded-2xl bg-background-light/50 px-6 py-4 text-sm text-text-muted'>
          No {status} memes
        </div>
      )}
      <div className='grid grid-cols-3 gap-4 lg:grid-cols-4'>
        {postQueries.map(({ data: message }, index) => {
          if (!message) return null

          return (
            <ModerationMemeItem
              key={message?.struct.id ?? index}
              message={message}
              chatId={chatId}
              hubId={hubId}
              showUnapprovedOnly={false}
            />
          )
        })}
      </div>
    </div>
  )
}

function Actions({ moderator }: { moderator: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { page, offset, status } = useModeratorSearchParams()

  const [total, setTotal] = useState<number | null>(null)
  useEffect(() => {
    setTotal(null)
  }, [moderator, status])
  const { isFetching, refetch, data } = useModeratedResourceQuery({ moderator })
  useEffect(() => {
    if (!data) return
    setTotal(data?.total ?? null)
  }, [data])

  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex items-center gap-4'>
        <Button
          variant={'transparent'}
          onClick={() => {
            refetch?.()
          }}
          size='circle'
          isLoading={isFetching}
          loadingText=''
        >
          <AiOutlineReload />
        </Button>
        <Tabs
          manualTabControl={{
            selectedTab: status === 'blocked' ? 1 : 0,
            setSelectedTab: (tab) => {
              const newSearchParams = new URLSearchParams(
                Array.from(searchParams?.entries() ?? [])
              )
              newSearchParams.set('status', tab === 0 ? 'approved' : 'blocked')
              router.push(`?${newSearchParams.toString()}`, undefined, {
                shallow: true,
              })
            },
          }}
          tabs={[
            { id: 'approved', text: 'Approved', content: () => <></> },
            { id: 'blocked', text: 'Blocked', content: () => <></> },
          ]}
        />
      </div>
      <div className='flex items-center gap-4 text-xl'>
        <span>
          {offset + 1}-
          {total ? (
            Math.min(total, offset + limit)
          ) : (
            <Skeleton className='inline-block w-6 align-middle' />
          )}{' '}
          from {total ?? <Skeleton className='inline-block w-6 align-middle' />}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            variant={'transparent'}
            onClick={() => {
              const newSearchParams = new URLSearchParams(
                Array.from(searchParams?.entries() ?? [])
              )
              newSearchParams.set('page', (page - 1).toString())
              router.push(`?${newSearchParams.toString()}`, undefined, {
                shallow: true,
              })
            }}
            size={'circleSm'}
            disabled={page === 1}
          >
            <MdOutlineKeyboardArrowLeft className='size-11' />
          </Button>
          <Button
            onClick={() => {
              const newSearchParams = new URLSearchParams(
                Array.from(searchParams?.entries() ?? [])
              )
              newSearchParams.set('page', (page + 1).toString())
              router.push(`?${newSearchParams.toString()}`, undefined, {
                shallow: true,
              })
            }}
            variant={'transparent'}
            size={'circleSm'}
            disabled={isFetching || page * limit >= (data?.total ?? 0)}
          >
            <MdOutlineKeyboardArrowRight className='size-11' />
          </Button>
        </div>
      </div>
    </div>
  )
}
