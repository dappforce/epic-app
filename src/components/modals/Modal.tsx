import { cx } from '@/utils/class-names'
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { VariantProps, cva } from 'class-variance-authority'
import { Fragment, ReactNode } from 'react'
import { HiOutlineChevronLeft, HiXMark } from 'react-icons/hi2'
import Button from '../Button'
import LinkText from '../LinkText'
import { CONTENT_POLICY_LINK } from '../moderation/utils'

export type ModalFunctionalityProps = {
  ref?: React.RefObject<any>
  id?: string
  isOpen: boolean
  closeModal: () => void
  onBackClick?: () => void
}

const panelStyles = cva(
  cx(
    'relative w-full rounded-[20px] bg-background-light',
    'text-left align-middle shadow-xl',
    'transform transition-all',
    'flex flex-col'
  ),
  {
    variants: {
      size: {
        sm: cx('max-w-sm'),
        md: cx('max-w-md'),
        lg: cx('max-w-lg'),
        'screen-md': cx('max-w-screen-md'),
        'screen-lg': cx('max-w-screen-lg'),
        'full-screen': cx('max-w-none'),
      },
    },
    defaultVariants: { size: 'lg' },
  }
)

export type ModalProps = ModalFunctionalityProps &
  VariantProps<typeof panelStyles> & {
    className?: string
    titleClassName?: string
    descriptionClassName?: string
    withCloseButton?: boolean
    children: React.ReactNode
    title?: React.ReactNode
    description?: React.ReactNode
    containerClassName?: string
    panelClassName?: string
    contentClassName?: string
    initialFocus?: React.RefObject<HTMLElement>
    withFooter?: boolean | ReactNode
    withoutOverlay?: boolean
    withoutShadow?: boolean
  }

export default function Modal({
  id,
  ref,
  children,
  className,
  titleClassName,
  contentClassName,
  panelClassName,
  containerClassName,
  size,
  descriptionClassName,
  closeModal,
  onBackClick,
  withoutOverlay,
  withoutShadow,
  withCloseButton,
  isOpen,
  title,
  description,
  initialFocus,
  withFooter,
}: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as='div'
        ref={ref}
        id={id}
        initialFocus={initialFocus}
        className={cx('relative z-40 text-text', className)}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
        onClose={closeModal}
      >
        {!withoutOverlay && (
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-lg' />
          </TransitionChild>
        )}

        <div className='fixed inset-0 w-screen overflow-y-auto'>
          <div
            className={cx(
              'flex min-h-full items-center justify-center p-4 text-center',
              containerClassName
            )}
          >
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel
                style={{ backfaceVisibility: 'hidden' }}
                className={cx(
                  panelStyles({ size }),
                  withoutShadow && 'shadow-none',
                  panelClassName
                )}
              >
                <div
                  className={cx(
                    'p-5 text-left align-middle md:p-6',
                    'transform',
                    'flex flex-col',
                    contentClassName
                  )}
                >
                  {withCloseButton && (
                    <Button
                      className='absolute right-6 m-1 mr-0 p-0 text-2xl text-text-muted'
                      variant='transparent'
                      onClick={closeModal}
                    >
                      <HiXMark />
                    </Button>
                  )}
                  {title && (
                    <DialogTitle
                      as='h3'
                      className={cx(
                        'mb-2 text-2xl',
                        withCloseButton && 'pr-8',
                        !description && 'mb-4',
                        titleClassName
                      )}
                    >
                      {onBackClick ? (
                        <div className='flex items-start'>
                          <Button
                            size='circle'
                            variant='transparent'
                            className='-ml-2 mr-2 text-lg text-text-muted'
                            onClick={onBackClick}
                          >
                            <HiOutlineChevronLeft />
                          </Button>
                          <span>{title}</span>
                        </div>
                      ) : (
                        title
                      )}
                    </DialogTitle>
                  )}
                  {description && (
                    <Description
                      className={cx(
                        'mb-4 text-text-muted',
                        descriptionClassName
                      )}
                    >
                      {description}
                    </Description>
                  )}

                  {children}
                </div>

                {withFooter && (
                  <div className='border-t border-background-lightest dark:border-background-lightest/50'>
                    {withFooter === true ? (
                      <div className='flex items-center justify-center gap-4 px-6 py-4 text-sm text-text-muted'>
                        <LinkText
                          href='https://subsocial.network/legal/privacy'
                          className='whitespace-nowrap font-normal'
                          openInNewTab
                        >
                          Privacy Policy
                        </LinkText>
                        <span>&middot;</span>
                        <LinkText
                          href='https://subsocial.network/legal/terms'
                          className='whitespace-nowrap font-normal'
                          openInNewTab
                        >
                          Terms of Service
                        </LinkText>
                        <span>&middot;</span>
                        <LinkText
                          href={CONTENT_POLICY_LINK}
                          className='whitespace-nowrap font-normal'
                          openInNewTab
                        >
                          Content Policy
                        </LinkText>
                      </div>
                    ) : (
                      withFooter
                    )}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
