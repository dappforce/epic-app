import usePaginatedMessageIds from '@/components/chats/hooks/usePaginatedMessageIds'
import { getPostExtensionProperties } from '@/components/extensions/utils'
import LinkText from '@/components/LinkText'
import MediaLoader from '@/components/MediaLoader'
import { getPostQuery } from '@/services/api/query'
import { cx } from '@/utils/class-names'
import { PostData } from '@subsocial/api/types'
import Link from 'next/link'
import { useEffect } from 'react'

const memeCardSize = 'w-[150px] h-[160px] min-w-[150px]'

type MemesPreviewProps = {
  hubId: string
  chatId: string
}

const MemesPreview = ({ chatId, hubId }: MemesPreviewProps) => {
  const { messageIds, isLoading, loadMore } = usePaginatedMessageIds({
    hubId,
    chatId,
    onlyDisplayUnapprovedMessages: false,
  })

  useEffect(() => {
    loadMore()
  }, [loadMore])

  const renderedMessageQueries = getPostQuery.useQueries(messageIds)

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <span className='text-lg font-bold'>Memes</span>
          <span className='font-semibold text-slate-400'>+345 today</span>
        </div>
        <LinkText variant='primary' href='/tg/memes'>
          See all
        </LinkText>
      </div>
      <div className='w-full overflow-hidden'>
        <div className='flex items-center gap-3 overflow-auto'>
          {renderedMessageQueries
            .slice(0, 5)
            .map(({ data: message }, index) => {
              if (!message) return null

              return <MemesPreviewItem key={index} message={message} />
            })}
          <Link
            href='/tg/memes'
            className={cx(
              'flex items-center justify-center rounded-xl bg-slate-700',
              memeCardSize
            )}
          >
            See all
          </Link>
        </div>
      </div>
    </div>
  )
}

const MemesPreviewItem = ({ message }: { message: PostData }) => {
  const { body, extensions } = message.content || {}

  if (!body && (!extensions || extensions.length === 0)) return null

  const imageExt = getPostExtensionProperties(
    extensions?.[0],
    'subsocial-image'
  )

  return (
    <MediaLoader
      containerClassName={cx(
        'overflow-hidden rounded-xl flex-1 justify-center flex items-center cursor-pointer',
        memeCardSize
      )}
      placeholderClassName={cx('w-full aspect-square')}
      className='object-contain '
      src={imageExt?.image}
    />
  )
}

export default MemesPreview
