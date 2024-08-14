import { cx } from '@/utils/class-names'
import { Checkbox } from '@headlessui/react'
import { FaCheck } from 'react-icons/fa6'

type ModerationCheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

const ModerationCheckbox = ({
  checked,
  onChange,
  className,
}: ModerationCheckboxProps) => {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      className={cx(
        'group flex size-6 cursor-pointer items-center justify-center rounded-lg border border-slate-400',
        'bg-transparent data-[checked]:border-none data-[checked]:bg-background-primary',
        className
      )}
    >
      <FaCheck className='stroke-white opacity-0 group-data-[checked]:opacity-100' />
    </Checkbox>
  )
}

export default ModerationCheckbox
