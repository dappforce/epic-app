import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import Name from '@/components/Name'
import SkeletonFallback from '@/components/SkeletonFallback'
import ProfileDetailModal from '@/components/chats/ChatItem/profilePosts/ProfileDetailModal'
import ProfilePostsList from '@/components/chats/ChatItem/profilePosts/ProfilePostsList'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import { env } from '@/env.mjs'
import { getPaginatedPostIdsByPostIdAndAccount } from '@/services/datahub/posts/queryByAccount'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { useRouter } from 'next/router'
import { useState } from 'react'
import {
  HiOutlineChevronLeft,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'

export default function MyMemesPage() {
  const myAddress = useMyMainAddress()
  const [isOpenDetail, setIsOpenDetail] = useState(false)

  return (
    <LayoutWithBottomNavigation
      withFixedHeight
      className='relative'
      pageNavigation={{ title: 'Airdrop', backLink: '/tg/menu' }}
    >
      <ProfileDetailModal
        isOpen={isOpenDetail}
        closeModal={() => setIsOpenDetail(false)}
        address={myAddress || ''}
      />
      <div className='relative mx-auto flex h-full max-h-full min-h-[400px] w-full flex-col items-center'>
        <ProfilePreviewHeader setIsOpenDetail={setIsOpenDetail} />
        <ProfilePostsList
          address={myAddress || ''}
          chatId={env.NEXT_PUBLIC_MAIN_CHAT_ID}
          hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
        />
      </div>
    </LayoutWithBottomNavigation>
  )
}

type ProfilePreviewProps = {
  setIsOpenDetail: (isOpen: boolean) => void
}

const ProfilePreviewHeader = ({ setIsOpenDetail }: ProfilePreviewProps) => {
  const router = useRouter()
  const myAddress = useMyMainAddress()

  const { data, isLoading } =
    getPaginatedPostIdsByPostIdAndAccount.useInfiniteQuery(
      env.NEXT_PUBLIC_MAIN_CHAT_ID,
      myAddress || ''
    )

  const totalPostsCount = data?.pages[0].totalData || 0

  return (
    <div
      className={cx(
        'relative mx-auto flex w-full items-center justify-between gap-2',
        'border-b border-slate-700 py-[10px] pl-1 pr-2'
      )}
    >
      <div className='flex flex-1 items-center gap-2'>
        <Button
          variant='transparent'
          size='circle'
          className='min-w-[auto]'
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()

            router.push('/tg/menu')
          }}
        >
          <HiOutlineChevronLeft />
        </Button>
        <AddressAvatar
          withProfileModal={false}
          address={myAddress || ''}
          className='-ml-1 flex-shrink-0 cursor-pointer'
        />
        <div className='flex flex-col gap-0.5'>
          <Name
            address={myAddress || ''}
            className='!text-text'
            clipText
            withProfileModal={false}
          />
          <span className='flex items-center gap-1 text-xs font-medium leading-[normal] text-slate-400'>
            <span>Memes:</span>
            <SkeletonFallback
              isLoading={isLoading}
              className='my-0 w-fit min-w-8'
            >
              {totalPostsCount}
            </SkeletonFallback>
          </span>
        </div>
      </div>
      <Button
        size='circleSm'
        variant='transparent'
        onClick={() => setIsOpenDetail(true)}
      >
        <HiOutlineInformationCircle className='text-lg text-text-muted' />
      </Button>
    </div>
  )
}
