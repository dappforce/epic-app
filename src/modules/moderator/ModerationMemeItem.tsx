import AddressAvatar from '@/components/AddressAvatar'
import MediaLoader from '@/components/MediaLoader'
import { ProfilePreviewModalName } from '@/components/ProfilePreviewModalWrapper'
import ChatRelativeTime from '@/components/chats/ChatItem/ChatRelativeTime'
import UnapprovedMemeCount from '@/components/chats/UnapprovedMemeCount'
import { getPostExtensionProperties } from '@/components/extensions/utils'
import { cx } from '@/utils/class-names'
import { PostData } from '@subsocial/api/types'
import { ComponentProps } from 'react'
import ModerationCheckbox from './Checkbox'
import { useModerationContext } from './ModerationContext'

export type MemeChatItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  message: PostData
  messageBubbleId?: string
  chatId: string
  hubId: string
}

export default function ModerationMemeItem({
  message,
  messageBubbleId,
  chatId,
  hubId,
  ...props
}: MemeChatItemProps) {
  const { selectedPostIds, setSelectedPostIds } = useModerationContext()
  const { ownerId } = message.struct
  const { body, extensions } = message.content || {}

  const displayedTime = message.struct.createdAtTime

  if (!body && (!extensions || extensions.length === 0)) return null
  if (message.struct.approvedInRootPost) return null

  const imageExt = getPostExtensionProperties(
    extensions?.[0],
    'subsocial-image'
  )

  const isSelected = selectedPostIds.includes(message.struct.id)

  return (
    <div
      {...props}
      className={cx(
        'relative flex h-full w-full flex-col gap-2',
        'overflow-hidden rounded-2xl bg-slate-800 pt-2',
        { ['ring-4 ring-text-primary']: isSelected },
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
      <div className='flex items-center justify-between gap-4 px-2'>
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
          </div>
        </div>
        <div className='flex min-w-fit items-center gap-2'>
          <ModerationCheckbox
            checked={selectedPostIds.includes(message.struct.id)}
            onChange={() => {
              setSelectedPostIds(
                selectedPostIds.includes(message.struct.id)
                  ? selectedPostIds.filter((id) => id !== message.struct.id)
                  : [...selectedPostIds, message.struct.id]
              )
            }}
          />
        </div>
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
      <div className='flex items-center justify-between gap-2 p-2 pt-0'>
        <UnapprovedMemeCount address={message.struct.ownerId} chatId={chatId} />
        <ChatRelativeTime
          isUpdated={message.struct.isUpdated}
          createdAtTime={displayedTime}
          className={cx('w-fit text-xs text-text-muted')}
        />
      </div>
    </div>
  )
}
