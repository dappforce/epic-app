import { cx } from '@/utils/class-names'
import Link from 'next/link'
import React from 'react'
import { MdOutlineKeyboardArrowRight } from 'react-icons/md'

type MenuProps = {
  menuItems: {
    title: string
    desc?: React.ReactNode
    disabled?: boolean
    hidden?: boolean
    icon: string
    href?: string
    onClick?: () => void
  }[][]
}

const Menu = ({ menuItems }: MenuProps) => {
  return (
    <>
      {menuItems.map((subItems, index) => {
        const subItemsWithoutHidden = subItems.filter((item) => !item.hidden)

        return (
          <div key={index} className='rounded-2xl bg-slate-800'>
            {subItemsWithoutHidden.map((item, index) => {
              return (
                <MenuItem
                  key={`subitem-${index}`}
                  {...item}
                  withBorder={index !== subItemsWithoutHidden.length - 1}
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
  desc?: React.ReactNode
  icon: string
  disabled?: boolean
  hidden?: boolean
  href?: string
  onClick?: () => void
  textClassName?: string
  withBorder?: boolean
}

const MenuItem = ({
  title,
  desc,
  icon,
  disabled,
  hidden,
  href,
  textClassName,
  onClick,
  withBorder,
}: MenuItemProps) => {
  const children = (
    <>
      <div className='flex items-center justify-between gap-2 px-[10px] py-[14px]'>
        <div className='flex items-center gap-[10px]'>
          {icon}
          <div className='flex flex-col gap-2'>
            <span
              className={cx(
                'text-base font-medium leading-none',
                textClassName
              )}
            >
              {title}
            </span>
            {desc}
          </div>
        </div>
        <MdOutlineKeyboardArrowRight className='text-[25px] text-slate-500' />
      </div>
      {withBorder && <div className='ml-11 border-b border-slate-700'></div>}
    </>
  )

  const commonClassName = cx('flex flex-col cursor-pointer', {
    ['!text-slate-400 cursor-not-allowed']: disabled,
  })

  return href ? (
    <Link href={href} className={commonClassName}>
      {children}
    </Link>
  ) : (
    <div className={commonClassName} onClick={onClick}>
      {children}
    </div>
  )
}

export default Menu
