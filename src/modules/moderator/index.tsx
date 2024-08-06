import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import Logo from '@/components/Logo'
import { env } from '@/env.mjs'
import { useTelegramLogin } from '@/providers/config/TelegramLoginProvider'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { ModerationContextWrapper } from './ModerationContext'
import PendingPostsList from './PendingPostsList'

const ModeratorPage = () => {
  return (
    <ModerationContextWrapper>
      <div className='mb-6 flex flex-col gap-2'>
        <Header />
        <Content />
      </div>
    </ModerationContextWrapper>
  )
}

const Header = () => {
  const { loginTelegram, isLoadingOrSubmitted } = useTelegramLogin()

  const myAddress = useMyMainAddress()

  const logout = useMyAccount((state) => state.logout)

  return (
    <div className='flex w-full items-center justify-center bg-slate-800 py-4'>
      <div className='flex w-full max-w-screen-xl items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Logo className='text-2xl' />
          <span className='text-sm font-medium text-text-primary'>
            Moderator
          </span>
        </div>
        {myAddress ? (
          <div className='flex items-center gap-4'>
            <AddressAvatar address={myAddress} />
            <Button
              variant={'redOutline'}
              onClick={() => {
                logout()
              }}
            >
              Log out
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              loginTelegram()
            }}
            variant='primary'
            isLoading={isLoadingOrSubmitted}
          >
            Login
          </Button>
        )}
      </div>
    </div>
  )
}

const Content = () => {
  return (
    <div className='flex  justify-center'>
      <div className='mx-4 w-full max-w-screen-xl'>
        <PendingPostsList
          hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
          chatId={env.NEXT_PUBLIC_MAIN_CHAT_ID}
        />
      </div>
    </div>
  )
}

export default ModeratorPage
