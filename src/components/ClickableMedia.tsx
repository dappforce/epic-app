import { cx } from '@/utils/class-names'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import MediaLoader from './MediaLoader'
import Modal from './modals/Modal'

export type ClickableMediaProps = Omit<ImageProps, 'onClick'> & {
  trigger?: (onClick: () => void) => JSX.Element
  enableMaxHeight?: boolean
  withBluredImage?: boolean
}

export default function ClickableMedia({
  trigger,
  ...props
}: ClickableMediaProps) {
  const [isOpenModal, setIsOpenModal] = useState(false)
  return (
    <>
      {trigger ? (
        trigger(() => setIsOpenModal(true))
      ) : (
        <Image
          {...props}
          className={cx('cursor-pointer', props.className)}
          onClick={() => setIsOpenModal(true)}
          alt={props.alt ?? ''}
        />
      )}
      {/* TODO: fix issue where tall images will have transparent space which makes the modal can't be closed when clicking on the that part */}
      <Modal
        isOpen={isOpenModal}
        closeModal={() => setIsOpenModal(false)}
        panelClassName='bg-transparent shadow-none h-full w-fit'
        contentClassName='!p-0 h-full'
        containerClassName='h-full'
        size='screen-md'
      >
        <MediaLoader
          {...props}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
          src={props.src ?? ''}
          containerClassName='h-full'
          className='h-full w-full max-w-screen-md'
          alt={props.alt ?? ''}
        />
      </Modal>
    </>
  )
}
