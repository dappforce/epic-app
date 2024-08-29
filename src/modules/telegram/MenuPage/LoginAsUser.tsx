import Button from '@/components/Button'
import Toast from '@/components/Toast'
import Input from '@/components/inputs/Input'
import { useMyAccount } from '@/stores/my-account'
import { cx, mutedTextColorStyles } from '@/utils/class-names'
import { useState } from 'react'
import { FaPlay, FaStop } from 'react-icons/fa'
import { toast } from 'sonner'
import { getStartParam } from './SearchUser'

const LoginAsUser = () => {
  const [value, setValue] = useState('')
  const { readOnlyLoginAsUser, readonlyUserAddress } = useMyAccount()

  const onClick = () => {
    const { address, error } = getStartParam(value)

    if (error) {
      toast.custom((t) => <Toast t={t} title={error} />, {
        duration: 5_000,
      })
    } else {
      readOnlyLoginAsUser(address || null)
    }
  }

  const onStopClick = () => {
    readOnlyLoginAsUser(null)
  }

  return (
    <>
      <div className='flex flex-col gap-1'>
        <span className={cx(mutedTextColorStyles)}>Log in as a user:</span>
        <div className='flex items-center gap-2'>
          <Input
            placeholder='Eth address or referral link'
            onChange={(e) => {
              setValue(e.target.value)
            }}
            className='h-[50px]'
          />

          <Button
            variant='primary'
            size={'md'}
            roundings={'xl'}
            className={cx(
              'flex h-[50px] w-full max-w-[50px] items-center justify-center p-0',
              {
                ['!bg-red-400']: readonlyUserAddress,
              }
            )}
            disabled={!value && !readonlyUserAddress}
            onClick={readonlyUserAddress ? onStopClick : onClick}
          >
            {readonlyUserAddress ? <FaStop /> : <FaPlay />}
          </Button>
        </div>
      </div>
    </>
  )
}

export default LoginAsUser
