import useRedirectToTgBotOnDesktop from '@/hooks/useRedirectToTgBotOnDesktop'
import { cx } from '@/utils/class-names'
import { ComponentProps } from 'react'
import useLoginInTelegramMiniApps from '../navbar/Navbar/telegramLogin/useLoginInTelegramMiniApps'
import MobileNavigation from './MobileNavigation'

export type DefaultLayoutProps = ComponentProps<'div'> & {
  withFixedHeight?: boolean
  withFixedWidth?: boolean
  pageNavigation?: {
    title: string
    backLink: string
  }
}

export default function LayoutWithBottomNavigation({
  children,
  style,
  withFixedHeight,
  withFixedWidth,
  ...props
}: DefaultLayoutProps) {
  useLoginInTelegramMiniApps()
  useRedirectToTgBotOnDesktop()

  return (
    <div
      {...props}
      className={cx(
        'mx-auto flex max-w-screen-md flex-col bg-background text-text',
        withFixedHeight && 'h-screen',
        props.className
      )}
      style={
        withFixedHeight
          ? { height: '100dvh', ...style }
          : { minHeight: '100svh', ...style }
      }
    >
      {/* <div className='overflow-auto'> */}
      {children}
      <MobileNavigation />
      {/* </div> */}
    </div>
  )
}
