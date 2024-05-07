import GrillGreyIcon from '@/assets/icons/grill-grey.svg'
import useIsMounted from '@/hooks/useIsMounted'
import { getIsLoggedIn, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { useRouter } from 'next/router'
import { IconType } from 'react-icons'
import { BiChat, BiNews } from 'react-icons/bi'
import { GoLaw } from 'react-icons/go'
import { LuCompass } from 'react-icons/lu'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { RiLineChartLine } from 'react-icons/ri'
import { TbCoins, TbWorld } from 'react-icons/tb'
import { TiFlashOutline } from 'react-icons/ti'
import { getLeaderboardLink } from '../leaderboard/utils'
import CustomLink from '../referral/CustomLink'

export default function Sidebar() {
  const myAddress = useMyMainAddress()
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return (
    <aside className='flex flex-col p-4 pl-0 text-[#64748BCC] dark:text-text-muted'>
      <ul className='flex flex-col gap-4'>
        <SidebarItem icon={BiNews} title='Feed' href='/' forceHardNavigation />
        <SidebarItem icon={BiChat} title='Chat' href='/' />
        <SidebarItem icon={GoLaw} title='Open Gov' href='/opengov' />
        {getIsLoggedIn() && (
          <SidebarItem
            icon={LuCompass}
            title='My Spaces'
            href={`/accounts/${myAddress}/spaces`}
            forceHardNavigation
          />
        )}

        <div className='border-t border-border-gray' />

        <SidebarItem icon={TbCoins} title='Content Staking' href='/staking' />
        <SidebarItem
          icon={MdOutlineLeaderboard}
          title='Leaderboard'
          href={getLeaderboardLink(myAddress)}
          forceHardNavigation
        />
        <SidebarItem
          icon={RiLineChartLine}
          title='Statistics'
          href='/stats'
          forceHardNavigation
        />

        <div className='border-t border-border-gray' />

        <SidebarItem
          icon={TbWorld}
          title='Usernames'
          href='/dd'
          forceHardNavigation
        />
        <SidebarItem
          icon={TiFlashOutline}
          title='Energy Station'
          href='/energy'
          forceHardNavigation
        />

        <div className='border-t border-border-gray' />

        <SidebarItem
          icon={GrillGreyIcon}
          title='What is Grill?'
          href='/landing'
          iconClassName='[&_path]:fill-current'
        />
      </ul>
    </aside>
  )
}

function SidebarItem({
  icon: Icon,
  title,
  href,
  forceHardNavigation,
  iconClassName,
}: {
  icon: IconType
  title: string
  href: string
  forceHardNavigation?: boolean
  iconClassName?: string
}) {
  const { pathname } = useRouter()
  return (
    <li>
      <CustomLink
        className={cx(
          'flex items-center gap-4 transition hover:text-text-primary focus-visible:text-text-primary',
          pathname === href && !forceHardNavigation && 'text-text-primary'
        )}
        forceHardNavigation={forceHardNavigation}
        href={href}
      >
        <Icon className={cx('text-xl', iconClassName)} />
        <span className='text-sm font-medium'>{title}</span>
      </CustomLink>
    </li>
  )
}
