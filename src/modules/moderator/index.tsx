import Button from '@/components/Button'
import Logo from '@/components/Logo'
import { env } from '@/env.mjs'
import PendingPostsList from './PendingPostsList'

const ModeratorPage = () => {
  return (
    <div className='flex flex-col gap-2'>
      <Header />
      <Content />
    </div>
  )
}

const Header = () => (
  <div className='flex w-full items-center justify-center bg-slate-800 py-4'>
    <div className='flex w-full max-w-screen-xl items-center justify-between'>
      <div className='flex items-center gap-4'>
        <Logo className='text-2xl' />
        <span className='text-sm font-medium text-text-primary'>Moderator</span>
      </div>
      <Button variant='primary'>Login</Button>
    </div>
  </div>
)

const Content = () => {
  return (
    <div className='flex  justify-center'>
      <div className='w-full max-w-screen-xl'>
        <PendingPostsList
          hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
          chatId={env.NEXT_PUBLIC_MAIN_CHAT_ID}
        />
      </div>
    </div>
  )
}

export default ModeratorPage
