import Button from '@/components/Button'
import Container from '@/components/Container'
import Loading from '@/components/Loading'
import ScrollableContainer from '@/components/ScrollableContainer'
import useAuthorizedForModeration from '@/hooks/useAuthorizedForModeration'
import { useConfigContext } from '@/providers/config/ConfigProvider'
import { getPostQuery } from '@/services/api/query'
import { getPostMetadataQuery } from '@/services/datahub/posts/query'
import { useSendEvent } from '@/stores/analytics'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { isTouchDevice } from '@/utils/device'
import { sendMessageToParentWindow } from '@/utils/window'
import { useMiniAppRaw } from '@tma.js/sdk-react'
import {
  ComponentProps,
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from 'react-icons/md'
import InfiniteScroll from 'react-infinite-scroll-component'
import CenterChatNotice from '../../ChatList/CenterChatNotice'
import ChatItemWithMenu from '../../ChatList/ChatItemWithMenu'
import ChatTopNotice from '../../ChatList/ChatTopNotice'
import { usePaginatedMessageIdsByAccount } from '../../hooks/usePaginatedMessageIds'

export type ChatListProps = ComponentProps<'div'> & {
  asContainer?: boolean
  scrollContainerRef?: React.RefObject<HTMLDivElement>
  scrollableContainerClassName?: string
  address: string
  hubId: string
  chatId: string
  newMessageNoticeClassName?: string
  topElement?: React.ReactNode
}

export default function ProfilePostsList(props: ChatListProps) {
  const isInitialized = useMyAccount((state) => state.isInitialized)

  return (
    <ProfilePostsListContent
      key={props.chatId}
      {...props}
      className={cx(!isInitialized && 'opacity-0', props.className)}
    />
  )
}

// If using bigger threshold, the scroll will be janky, but if using 0 threshold, it sometimes won't trigger `next` callback
const SCROLL_THRESHOLD = 20

function ProfilePostsListContent({
  asContainer,
  scrollableContainerClassName,
  hubId,
  address,
  chatId,
  scrollContainerRef,
  newMessageNoticeClassName,
  ...props
}: ChatListProps) {
  const { data: postMetadata } = getPostMetadataQuery.useQuery(chatId)
  const app = useMiniAppRaw(true)

  const isDesktop = !isTouchDevice() && !app?.result

  const { isAuthorized } = useAuthorizedForModeration(chatId)

  const { messageIds, hasMore, loadMore, totalDataCount, currentPage } =
    usePaginatedMessageIdsByAccount({
      hubId,
      chatId,
      account: address,
      isModerator: isAuthorized,
    })

  useEffect(() => {
    sendMessageToParentWindow('totalMessage', (totalDataCount ?? 0).toString())
  }, [totalDataCount])

  const myAddress = useMyMainAddress()
  const { data: chat } = getPostQuery.useQuery(chatId)
  const isMyChat = chat?.struct.ownerId === myAddress

  const renderedMessageQueries = getPostQuery.useQueries(messageIds)

  return (
    <div
      {...props}
      className={cx(
        'relative flex w-full flex-1 flex-col pb-4',
        { ['overflow-hidden !pb-0']: !isDesktop },
        props.className
      )}
    >
      {totalDataCount === 0 && (
        <CenterChatNotice
          isMyChat={isMyChat}
          customText={
            (postMetadata?.totalCommentsCount ?? 0) > 0
              ? 'Loading messages...'
              : undefined
          }
          className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        />
      )}
      {isDesktop ? (
        <DesktopProfilePostsList
          messageIds={messageIds}
          totalDataCount={totalDataCount}
          renderedMessageQueries={renderedMessageQueries}
          loadMore={loadMore}
          chatId={chatId}
          hubId={hubId}
        />
      ) : (
        <MobileProfilePostsList
          scrollContainerRef={scrollContainerRef}
          scrollableContainerClassName={scrollableContainerClassName}
          asContainer={asContainer}
          renderedMessageQueries={renderedMessageQueries}
          currentPage={currentPage}
          loadMore={loadMore}
          hasMore={hasMore}
          hubId={hubId}
          chatId={chatId}
        />
      )}
    </div>
  )
}

type MobileProfilePostsListProps = {
  scrollContainerRef?: React.RefObject<HTMLDivElement>
  scrollableContainerClassName?: string
  asContainer?: boolean
  renderedMessageQueries: ReturnType<typeof getPostQuery.useQuery>[]
  currentPage: number
  loadMore: () => void
  hasMore: boolean
  hubId: string
  chatId: string
}

const MobileProfilePostsList = ({
  scrollContainerRef: _scrollContainerRef,
  scrollableContainerClassName,
  asContainer,
  renderedMessageQueries,
  currentPage,
  loadMore,
  hasMore,
  hubId,
  chatId,
}: MobileProfilePostsListProps) => {
  const sendEvent = useSendEvent()
  const { enableBackButton } = useConfigContext()
  const scrollableContainerId = useId()

  const innerScrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = _scrollContainerRef || innerScrollContainerRef
  const { isAuthorized } = useAuthorizedForModeration(chatId)

  const innerRef = useRef<HTMLDivElement>(null)

  const Component = asContainer ? Container<'div'> : 'div'
  return (
    <ScrollableContainer
      id={scrollableContainerId}
      ref={scrollContainerRef}
      className={cx(
        'flex flex-col overflow-x-hidden overflow-y-scroll @container',
        scrollableContainerClassName
      )}
    >
      <Component
        ref={innerRef}
        className={cx(enableBackButton === false && 'px-0', 'flex')}
      >
        <div className='flex-1'>
          <InfiniteScroll
            dataLength={renderedMessageQueries.length}
            next={() => {
              loadMore()
              sendEvent('load_more_messages', { currentPage })
            }}
            className={cx(
              'relative flex w-full flex-col !overflow-hidden pb-2',
              // need to have enough room to open message menu
              'min-h-[400px]'
            )}
            hasMore={hasMore}
            scrollableTarget={scrollableContainerId}
            loader={<Loading className='pb-2 pt-4' />}
            endMessage={
              renderedMessageQueries.length === 0 ? null : (
                <ChatTopNotice
                  className='pb-2 pt-4'
                  label='You have seen all memes from this user!'
                />
              )
            }
            scrollThreshold={`${SCROLL_THRESHOLD}px`}
          >
            {renderedMessageQueries.map(({ data: message }, index) => {
              // bottom message is the first element, because the flex direction is reversed
              if (!message) return null

              return (
                <Fragment key={message?.id ?? index}>
                  <ChatItemWithMenu
                    chatItemClassName='mt-2'
                    chatId={chatId}
                    hubId={hubId}
                    message={message}
                    enableProfileModal={false}
                    showBlockedMessage={isAuthorized}
                    showBlockButton={isAuthorized}
                    menuIdPrefix='profile-posts-list'
                  />
                </Fragment>
              )
            })}
          </InfiniteScroll>
        </div>
      </Component>
    </ScrollableContainer>
  )
}

const PAGE_SIZE = 8

type DesktopProfilePostsListProps = {
  messageIds: string[]
  totalDataCount: number
  renderedMessageQueries: ReturnType<typeof getPostQuery.useQuery>[]
  loadMore: () => void
  chatId: string
  hubId: string
}

const DesktopProfilePostsList = ({
  messageIds,
  totalDataCount,
  renderedMessageQueries,
  loadMore,
  chatId,
  hubId,
}: DesktopProfilePostsListProps) => {
  const [page, setPage] = useState(1)

  const offset = (page - 1) * PAGE_SIZE

  const totalByPage = offset + PAGE_SIZE
  const { isAuthorized } = useAuthorizedForModeration(chatId)

  const postsIdsByPage = useMemo(() => {
    return renderedMessageQueries.slice(offset, offset + PAGE_SIZE)
  }, [renderedMessageQueries, offset])

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-end gap-4'>
        <span>
          {messageIds.length ? offset + 1 : 0}-
          {totalByPage > totalDataCount ? totalDataCount : totalByPage} from{' '}
          {totalDataCount}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            variant={'transparent'}
            onClick={() => {
              setPage(page - 1)
            }}
            size={'circleSm'}
            disabled={page === 1}
          >
            <MdOutlineKeyboardArrowLeft className='size-11' />
          </Button>
          <Button
            onClick={() => {
              loadMore()
              setPage(page + 1)
            }}
            variant={'transparent'}
            size={'circleSm'}
            disabled={page * 8 >= totalDataCount}
          >
            <MdOutlineKeyboardArrowRight className='size-11' />
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-3 gap-4 lg:grid-cols-4'>
        {postsIdsByPage.map(({ data: message }, index) => {
          if (!message) return null

          return (
            <div key={message.id} className='h-full'>
              <ChatItemWithMenu
                chatItemClassName='mt-2 h-full'
                chatId={chatId}
                hubId={hubId}
                noBorder
                withWrapper
                message={message}
                enableProfileModal={false}
                showBlockedMessage={isAuthorized}
                showBlockButton={isAuthorized}
                containerProps={{ className: 'flex-1' }}
                menuIdPrefix='profile-posts-list'
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
