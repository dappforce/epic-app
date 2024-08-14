import Link from 'next/link'
import { MdOutlineKeyboardArrowRight } from 'react-icons/md'

type MenuProps = {
  menuItems: {
    title: string
    icon: string
    href: string
  }[][]
}

const Menu = ({ menuItems }: MenuProps) => {
  return (
    <>
      {menuItems.map((subItems, index) => {
        return (
          <div key={index} className='rounded-2xl bg-slate-800'>
            {subItems.map((item, index) => {
              return (
                <MenuItem
                  key={`subitem-${index}`}
                  {...item}
                  withBorder={index !== subItems.length - 1}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
}

type MenuItemProps = {
  title: string
  icon: string
  href: string
  withBorder?: boolean
}

const MenuItem = ({ title, icon, href, withBorder }: MenuItemProps) => {
  return (
    <Link href={href} className='flex flex-col'>
      <div className='flex items-center justify-between gap-2 px-[10px] py-[14px]'>
        <div className='flex items-center gap-[10px]'>
          {icon}
          <span className='text-base font-medium'>{title}</span>
        </div>
        <MdOutlineKeyboardArrowRight className='text-[25px] text-slate-500' />
      </div>
      {withBorder && <div className='ml-11 border-b border-slate-700'></div>}
    </Link>
  )
}

export default Menu
