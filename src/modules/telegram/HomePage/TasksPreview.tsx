import TapTheCat from '@/assets/graphics/tasks/tap-the-cat.png'
import LinkText from '@/components/LinkText'
import { useSendEvent } from '@/stores/analytics'
import { DailyTasks, TaskCard } from '../TasksPage'

const TasksPreview = () => {
  const sendEvent = useSendEvent()

  return (
    <div className='flex flex-col gap-4 px-4'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-lg font-bold'>Daily Tasks</span>
        <LinkText variant='primary' href='/tg/tasks'>
          See all
        </LinkText>
      </div>
      <div className='flex flex-col gap-2'>
        <DailyTasks withTitle={false} />
        <TaskCard
          image={TapTheCat}
          onClick={() => {
            sendEvent('tasks_tap_the_cat_open')
          }}
          title='Tap the cat'
          href='/tg/memes'
          reward={'43,200/day'}
          completed={false}
        />
      </div>
    </div>
  )
}

export default TasksPreview
