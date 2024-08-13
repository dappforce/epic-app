import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import SelectInput, { ListItem } from '@/components/inputs/SelectInput'
import Logo from '@/components/Logo'
import { useTelegramLogin } from '@/providers/config/TelegramLoginProvider'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { isValidElement } from 'react'
import { MdAddModerator } from 'react-icons/md'

export default function ModeratorHeader() {
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
            <ModeratorFilter />
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

const dummy: ListItem[] = [
  {
    id: '',
    label: 'Not Filtered',
    icon: (
      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-background-lightest'>
        <MdAddModerator />
      </div>
    ),
  },
  {
    id: '0x8719EcD89839E6dcb13E508affC4320eb021377e',
    label: 'Teodorus Nathaniel',
    icon: (
      <AddressAvatar
        address='0x8719EcD89839E6dcb13E508affC4320eb021377e'
        className='flex h-7 w-7 items-center justify-center rounded-full bg-background-lightest'
      />
    ),
  },
]

function ModeratorFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selected =
    dummy.find((item) => item.id === searchParams?.get('moderator')) || dummy[0]

  return (
    <div className='flex items-center gap-2'>
      <span className='text-text-muted'>Filter by:</span>
      <SelectInput
        items={dummy}
        selected={selected}
        setSelected={(selected) =>
          router.push(`?moderator=${selected.id}`, undefined, { shallow: true })
        }
        buttonClassName={cx('py-1.5 pl-3 w-44')}
        optionClassName='p-1.5'
        renderItem={(item) => (
          <div className='flex cursor-pointer items-center gap-2.5 text-base'>
            {isValidElement(item.icon) ? item.icon : null}
            <span className='line-clamp-1'>{item.label}</span>
          </div>
        )}
      />
    </div>
  )
}
