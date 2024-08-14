import AddressAvatar from '@/components/AddressAvatar'
import Button from '@/components/Button'
import SelectInput, { ListItem } from '@/components/inputs/SelectInput'
import Logo from '@/components/Logo'
import Name from '@/components/Name'
import { useTelegramLogin } from '@/providers/config/TelegramLoginProvider'
import { getAllModeratorsQuery } from '@/services/datahub/moderation/query'
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

function ModeratorFilter() {
  const { data: moderators } = getAllModeratorsQuery.useQuery(null)
  const options: ListItem[] = [
    {
      id: '',
      label: 'Not Filtered',
      icon: (
        <div className='flex h-7 w-7 items-center justify-center rounded-full bg-background-lightest'>
          <MdAddModerator />
        </div>
      ),
    },
  ]
  moderators?.forEach((address) => {
    options.push({
      id: address,
      label: <Name address={address} withProfileModal={false} clipText />,
      icon: (
        <AddressAvatar
          address={address}
          className='flex h-7 w-7 items-center justify-center rounded-full bg-background-lightest'
        />
      ),
    })
  })

  const searchParams = useSearchParams()
  const router = useRouter()

  const selected =
    options.find((item) => item.id === searchParams?.get('moderator')) ||
    options[0]

  return (
    <div className='flex items-center gap-2'>
      <span className='text-text-muted'>Filter by:</span>
      <SelectInput
        items={options}
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
