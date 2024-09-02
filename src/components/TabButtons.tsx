import { cx } from '@/utils/class-names'
import Button from './Button'

export default function TabButtons({
  className,
  selectedTab,
  setSelectedTab,
  tabs,
}: {
  className?: string
  tabs: string[]
  selectedTab: string
  setSelectedTab: (tab: string) => void
}) {
  return (
    <div
      className={cx(
        'grid grid-cols-2 gap-px rounded-full bg-background-light text-sm font-medium',
        className
      )}
    >
      {tabs.map((tab) => (
        <Button
          key={tab}
          variant={selectedTab === tab ? 'primary' : 'transparent'}
          className={cx(
            'h-10 py-0',
            selectedTab === tab
              ? 'bg-background-primary/30'
              : 'bg-background-light'
          )}
          onClick={() => setSelectedTab(tab)}
        >
          {tab}
        </Button>
      ))}
    </div>
  )
}
