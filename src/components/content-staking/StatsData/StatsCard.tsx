import PopOver from '@/components/floating/PopOver'
import { FiInfo } from 'react-icons/fi'
import { cx } from '../../../utils/class-names'
import { sectionBg } from '../utils/SectionWrapper'

type StatsCardProps = {
  title: React.ReactNode
  desc: React.ReactNode
  subDesc?: React.ReactNode
  tooltipText?: React.ReactNode
  titleClassName?: string
}

const StatsCard = (props: StatsCardProps) => {
  return (
    <div
      className={cx(
        'flex w-full flex-col items-center gap-2 rounded-2xl p-4',
        sectionBg
      )}
    >
      <StatsCardContent {...props} />
    </div>
  )
}

export const StatsCardContent = ({
  title,
  desc,
  subDesc,
  tooltipText,
  titleClassName,
}: StatsCardProps) => {
  return (
    <>
      <div className='text-base font-normal leading-[22px] text-slate-300'>
        {tooltipText ? (
          <PopOver
            trigger={
              <div className={cx('flex items-center gap-2')}>
                {title}
                <FiInfo className='block text-xs' />
              </div>
            }
            panelSize='sm'
            triggerClassName={titleClassName}
            yOffset={4}
            placement='top'
            triggerOnHover
          >
            {tooltipText}
          </PopOver>
        ) : (
          title
        )}
      </div>
      <div className='text-2xl font-semibold leading-8 text-text'>{desc}</div>
      {subDesc && (
        <div className='text-base font-normal leading-none text-slate-300'>
          {subDesc}
        </div>
      )}
    </>
  )
}

export default StatsCard
