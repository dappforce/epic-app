import { cx } from '@/utils/class-names'
import Link from 'next/link'
import { IoIosArrowBack } from 'react-icons/io'

type BackButtonProps = {
  title: string
  backPath: string
  className?: string
}

const BackButton = ({ title, backPath, className }: BackButtonProps) => {
  return (
    <div className={cx('z-10 w-full', className)}>
      <Link href={backPath} className='flex w-fit items-center gap-4'>
        <IoIosArrowBack className='size-6 text-slate-400' />
        <span className='text-lg font-semibold'>{title}</span>
      </Link>
    </div>
  )
}

export default BackButton
