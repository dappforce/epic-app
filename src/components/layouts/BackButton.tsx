import { cx } from '@/utils/class-names'
import Link from 'next/link'
import { IoIosArrowBack } from 'react-icons/io'

type BackButtonProps = {
  title: string
  backPath?: string
  backClick?: () => void
  className?: string
}

const BackButton = ({
  title,
  backPath,
  backClick,
  className,
}: BackButtonProps) => {
  const children = (
    <>
      <IoIosArrowBack className='size-6 text-slate-400' />
      <span className='text-lg font-semibold'>{title}</span>
    </>
  )

  const commonClassnName = 'flex w-fit items-center gap-4 cursor-pointer'

  return (
    <div className={cx('z-10 w-full', className)}>
      {backPath ? (
        <Link href={backPath} className={commonClassnName}>
          {children}
        </Link>
      ) : (
        <div onClick={backClick} className={commonClassnName}>
          {children}
        </div>
      )}
    </div>
  )
}

export default BackButton
