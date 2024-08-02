import AddressAvatar from '@/components/AddressAvatar'
import MediaLoader from '@/components/MediaLoader'
import { ProfilePreviewModalName } from '@/components/ProfilePreviewModalWrapper'
import ChatRelativeTime from '@/components/chats/ChatItem/ChatRelativeTime'
import UnapprovedMemeCount from '@/components/chats/UnapprovedMemeCount'
import { getPostExtensionProperties } from '@/components/extensions/utils'
import { cx } from '@/utils/class-names'
import { Checkbox } from '@headlessui/react'
import { PostData } from '@subsocial/api/types'
import { ComponentProps } from 'react'

export type MemeChatItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  message: PostData
  messageBubbleId?: string
  chatId: string
  hubId: string
  setSelectedPostIds: (ids: string[]) => void
  selectedPostIds: string[]
}

export default function ModerationMemeItem({
  message,
  messageBubbleId,
  chatId,
  hubId,
  selectedPostIds,
  setSelectedPostIds,
  ...props
}: MemeChatItemProps) {
  const { ownerId } = message.struct
  const { body, extensions } = message.content || {}

  const displayedTime = message.struct.createdAtTime

  if (!body && (!extensions || extensions.length === 0)) return null

  const imageExt = getPostExtensionProperties(
    extensions?.[0],
    'subsocial-image'
  )

  return (
    <div
      {...props}
      className={cx(
        'relative flex h-full w-full flex-col gap-2',
        'rounded-2xl bg-slate-800 p-2',
        props.className
      )}
      onClick={() => {
        setSelectedPostIds(
          selectedPostIds.includes(message.struct.id)
            ? selectedPostIds.filter((id) => id !== message.struct.id)
            : [...selectedPostIds, message.struct.id]
        )
      }}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <AddressAvatar
            address={ownerId}
            className='h-[38px] w-[38px] flex-shrink-0 cursor-pointer'
          />
          <div className='flex flex-col overflow-hidden'>
            <ProfilePreviewModalName
              clipText
              showModeratorChip
              labelingData={{ chatId }}
              messageId={message.id}
              address={ownerId}
              chatId={chatId}
              hubId={hubId}
              className={cx('text-sm font-medium text-text-secondary')}
            />
            <UnapprovedMemeCount
              address={message.struct.ownerId}
              chatId={chatId}
            />
          </div>
        </div>

        <Checkbox
          checked={selectedPostIds.includes(message.struct.id)}
          onChange={() => {
            setSelectedPostIds(
              selectedPostIds.includes(message.struct.id)
                ? selectedPostIds.filter((id) => id !== message.struct.id)
                : [...selectedPostIds, message.struct.id]
            )
          }}
          className='group block size-8 rounded bg-slate-900 data-[checked]:bg-background-primary'
        >
          <svg
            className='stroke-white opacity-0 group-data-[checked]:opacity-100'
            viewBox='0 0 14 14'
            fill='none'
          >
            <path
              d='M3 8L6 11L11 3.5'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </Checkbox>
      </div>
      <MediaLoader
        containerClassName='overflow-hidden w-full h-full justify-center flex items-center cursor-pointer'
        placeholderClassName={cx('w-full aspect-square')}
        className='w-full object-contain'
        src={imageExt?.image}
      />
      {body && (
        <p className={cx('whitespace-pre-wrap break-words px-2 text-base')}>
          {body}
        </p>
      )}
      <ChatRelativeTime
        isUpdated={message.struct.isUpdated}
        createdAtTime={displayedTime}
        className={cx('w-fit text-xs text-text-muted')}
      />
    </div>
  )
}
