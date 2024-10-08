import { cx } from '@/utils/class-names'
import { Transition } from '@headlessui/react'
import { useViewportRaw } from '@tma.js/sdk-react'
import { usePrevious } from '@uidotdev/usehooks'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'
import Button from './Button'
import { ModalFunctionalityProps, ModalProps } from './modals/Modal'

export default function BottomDrawer({
  isOpen,
  children,
  closeModal,
  title,
  description,
  withCloseButton = true,
}: ModalFunctionalityProps &
  Pick<ModalProps, 'title' | 'description' | 'children' | 'withCloseButton'>) {
  const viewport = useViewportRaw(true)
  const viewportHeight = viewport?.result?.stableHeight
  const prevHeight = usePrevious(viewportHeight)
  const offset = Math.max(0, (prevHeight ?? 0) - (viewportHeight ?? 0))

  return createPortal(
    <>
      <Transition
        show={isOpen}
        appear
        as='div'
        className='fixed inset-0 z-40 h-full w-full bg-black/50 backdrop-blur-md transition duration-300'
        enterFrom={cx('opacity-0')}
        enterTo='opacity-100'
        leaveFrom='h-auto'
        leaveTo='opacity-0 !duration-150'
        onClick={closeModal}
      />
      <Transition
        show={isOpen}
        appear
        as='div'
        className='fixed bottom-0 left-1/2 z-40 mx-auto flex h-auto w-full max-w-screen-md -translate-x-1/2 rounded-t-[10px] bg-background-light outline-none transition duration-300'
        enterFrom={cx('opacity-0 translate-y-48')}
        enterTo='opacity-100 translate-y-0'
        leaveFrom='h-auto'
        leaveTo='opacity-0 translate-y-24 !duration-150'
      >
        {withCloseButton && (
          <Button
            size='circleSm'
            variant='transparent'
            className='absolute right-4 top-4'
            onClick={closeModal}
          >
            <HiXMark className='text-lg' />
          </Button>
        )}
        <div className='mx-auto flex w-full max-w-screen-md flex-col gap-6 overflow-auto px-5 py-6 pb-6'>
          <div className='flex flex-col gap-2'>
            <span className={cx('text-2xl font-medium')}>{title}</span>
            <span className='text-text-muted'>{description}</span>
          </div>
          <div className='flex w-full flex-col'>
            {children}
            {/* blank space offset so the input got pushed up, because in telegram apps, virtual keyboard doesn't push the content up when opened */}
            <div style={{ height: offset }} />
          </div>
        </div>
      </Transition>
    </>,
    document.body
  )
}
