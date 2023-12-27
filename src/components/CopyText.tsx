import { spaceMono } from '@/fonts'
import { cx, interactionRingStyles } from '@/utils/class-names'
import { isTouchDevice } from '@/utils/device'
import { copyToClipboard } from '@/utils/strings'
import { Placement } from '@floating-ui/react'
import { cva, VariantProps } from 'class-variance-authority'
import { ComponentProps, ReactNode, useEffect, useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { MdOutlineContentCopy } from 'react-icons/md'
import Button from './Button'
import PopOver, { PopOverProps } from './floating/PopOver'

type CommonCopyTextProps = ComponentProps<'div'> & {
  text: ReactNode | null
  textToCopy?: string
  onCopyClick?: () => void
  isCodeText?: boolean
  withHideButton?: boolean
}

const copyTextStyles = cva('', {
  variants: {
    size: {
      md: 'px-4 py-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

function getTextToCopy({
  text,
  textToCopy,
}: Pick<CommonCopyTextProps, 'text' | 'textToCopy'>) {
  return textToCopy || (typeof text === 'string' ? text : '')
}

export type CopyTextProps = CommonCopyTextProps &
  VariantProps<typeof copyTextStyles> & {
    wordBreakType?: 'words' | 'all'
  }
export function CopyText({
  text,
  textToCopy,
  onCopyClick,
  isCodeText,
  withHideButton,
  wordBreakType = 'words',
  size,
  ...props
}: CopyTextProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  const handleClick = () => {
    copyToClipboard(getTextToCopy({ text, textToCopy }))

    onCopyClick?.()
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  const fontClassName = isCodeText && spaceMono.className

  return (
    <div
      {...props}
      className={cx('flex flex-col items-stretch gap-4', props.className)}
    >
      <div
        className={cx(
          'flex items-stretch rounded-2xl border border-border-gray',
          fontClassName
        )}
      >
        <div
          className={cx(
            'cursor-pointer select-all break-words px-4 py-2',
            wordBreakType === 'words' ? 'break-words' : 'break-all',
            copyTextStyles({ size }),
            isHidden && 'blur-sm'
          )}
        >
          {text}
        </div>
        {withHideButton && (
          <Button
            size='noPadding'
            variant='transparent'
            className={cx(
              'block rounded-l-none rounded-r-2xl px-4 text-2xl',
              interactionRingStyles()
            )}
            interactive='brightness-only'
            onClick={() => setIsHidden((prev) => !prev)}
          >
            {isHidden ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
          </Button>
        )}
      </div>
      <Button disabled={isCopied} onClick={handleClick} size='lg'>
        {isCopied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}

export type CopyTextInlineProps = CommonCopyTextProps & {
  tooltip?: string
  tooltipPlacement?: Placement
  textClassName?: string
  textContainerClassName?: string
  withButton?: boolean
}
export function CopyTextInline({
  text,
  textToCopy,
  onCopyClick,
  isCodeText: codeText,
  withHideButton,
  tooltip,
  tooltipPlacement,
  textClassName,
  textContainerClassName,
  withButton = true,
  ...props
}: CopyTextInlineProps) {
  const [openTooltipClickTrigger, setOpenTooltipClickTrigger] = useState(false)
  const [openTooltipHoverTrigger, setOpenTooltipHoverTrigger] = useState(false)

  useEffect(() => {
    if (!openTooltipClickTrigger) return
    setTimeout(() => {
      setOpenTooltipClickTrigger(false)
      setOpenTooltipHoverTrigger(false)
    }, 2000)
  }, [openTooltipClickTrigger])

  const handleClick = () => {
    copyToClipboard(getTextToCopy({ text, textToCopy }))
    onCopyClick?.()
  }

  const fontClassName = codeText && spaceMono.className

  let trigger = (
    <div {...props} className={cx('flex items-center gap-2', props.className)}>
      {text && (
        <div
          className={cx('w-full cursor-pointer', fontClassName, textClassName)}
          onClick={handleClick}
        >
          {text}
        </div>
      )}
      <Button
        variant='transparent'
        className='p-1 text-text-primary'
        onClick={handleClick}
      >
        <MdOutlineContentCopy />
      </Button>
    </div>
  )

  const commonPopOverProps = {
    panelSize: 'sm',
    yOffset: 12,
    children: <p>Copied!</p>,
    placement: tooltipPlacement,
  } satisfies Partial<PopOverProps>

  if (tooltip) {
    let commonHoverPopOverProps = {
      ...commonPopOverProps,
      triggerOnHover: true,
      children: <p>{tooltip}</p>,
    } satisfies Partial<PopOverProps>

    trigger = (
      <PopOver
        {...commonHoverPopOverProps}
        manualTrigger={{
          isOpen:
            openTooltipClickTrigger || isTouchDevice()
              ? false
              : openTooltipHoverTrigger,
          setIsOpen: setOpenTooltipHoverTrigger,
        }}
        trigger={trigger}
      />
    )
  }

  return (
    <PopOver
      {...commonPopOverProps}
      manualTrigger={{
        isOpen: openTooltipClickTrigger,
        setIsOpen: setOpenTooltipClickTrigger,
      }}
      trigger={trigger}
    />
  )
}
