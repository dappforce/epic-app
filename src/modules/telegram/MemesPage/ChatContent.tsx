import MemeChatRoom from '@/components/chats/ChatRoom/MemeChatRoom'
import { env } from '@/env.mjs'
import useIsModerationAdmin from '@/hooks/useIsModerationAdmin'
import PointsWidget from '@/modules/points/PointsWidget'
import { getServerTimeQuery } from '@/services/api/query'
import { cx } from '@/utils/class-names'
import { getIsContestEnded } from '@/utils/contest'
import { useLocalStorage } from '@uidotdev/usehooks'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Router, { useRouter } from 'next/router'
import { useLayoutEffect } from 'react'
import { ChatTabs, TabState, tabStates } from './ChatTabs'

dayjs.extend(duration)

type Props = {
  className?: string
}

const chatIdsBasedOnSelectedTab = {
  all: env.NEXT_PUBLIC_MAIN_CHAT_ID,
  contest: env.NEXT_PUBLIC_CONTEST_CHAT_ID,
  'not-approved': env.NEXT_PUBLIC_MAIN_CHAT_ID,
  'not-approved-contest': env.NEXT_PUBLIC_CONTEST_CHAT_ID,
}

export default function MemePageChatContent() {
  const { query } = useRouter()
  const isAdmin = useIsModerationAdmin()
  let [selectedTab, setSelectedTab] = useLocalStorage<TabState>(
    'memes-tab',
    'all'
  )
  if (
    !tabStates.includes(selectedTab) ||
    (selectedTab === 'contest' && getIsContestEnded())
  ) {
    selectedTab = 'all'
  } else if (selectedTab === 'not-approved-contest' && getIsContestEnded()) {
    selectedTab = 'not-approved'
  }
  if (
    !isAdmin &&
    (selectedTab === 'not-approved' || selectedTab === 'not-approved-contest')
  ) {
    setSelectedTab('all')
  }

  useLayoutEffect(() => {
    if (query.tab === 'contest') {
      setSelectedTab('contest')
      Router.replace('?', undefined, { shallow: true })
    } else if (query.tab === 'all') {
      setSelectedTab('all')
      Router.replace('?', undefined, { shallow: true })
    }
  }, [query.tab, setSelectedTab])

  const { data: serverTime } = getServerTimeQuery.useQuery(null)
  const isContestEnded = !!(
    selectedTab === 'contest' &&
    serverTime &&
    env.NEXT_PUBLIC_CONTEST_END_TIME < serverTime
  )

  const chatId = chatIdsBasedOnSelectedTab[selectedTab]
  const isContest = chatId === env.NEXT_PUBLIC_CONTEST_CHAT_ID
  const shouldShowUnapproved =
    selectedTab === 'not-approved' || selectedTab === 'not-approved-contest'

  return (
    <>
      <PointsWidget
        isNoTgScroll
        className={cx('sticky top-0', { ['hidden']: isAdmin })}
      />
      <ChatTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        className={cx(isAdmin && 'top-0')}
      />
      <MemeChatRoom
        chatId={chatId}
        shouldShowUnapproved={shouldShowUnapproved}
        isContest={isContest ? { isContestEnded } : undefined}
      />
    </>
  )
}
