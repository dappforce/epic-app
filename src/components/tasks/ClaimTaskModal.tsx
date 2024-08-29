import Diamond from '@/assets/emojis/diamond.png'
import VerticalStepsDots from '@/assets/icons/vertical-steps-dots.svg'
import WarningIcon from '@/assets/icons/warning.png'
import Button from '@/components/Button'
import useToastError from '@/hooks/useToastError'
import { GamificationTaskName } from '@/services/datahub/generated-query'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { getUserReferralStatsQuery } from '@/services/datahub/leaderboard/query'
import { GamificationTask } from '@/services/datahub/tasks'
import { useClaimTaskTokens } from '@/services/datahub/tasks/mutation'
import {
  clearGamificationTasksError,
  getGamificationTasksErrorQuery,
  getGamificationTasksQuery,
} from '@/services/datahub/tasks/query'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { formatNumber } from '@/utils/strings'
import { Transition } from '@headlessui/react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiXMark } from 'react-icons/hi2'
import TasksRewardsModal from './TasksRewardsModal'
import { modalConfigByVariant } from './config'

type ClaimTaskModalProps = {
  close: () => void
  isOpen: boolean
  task: GamificationTask
}

const ClaimTaskModal = ({ isOpen, task, close }: ClaimTaskModalProps) => {
  const [isOpenAnimation, setIsOpenAnimation] = useState(false)
  const client = useQueryClient()
  const [loading, setLoading] = useState(false)
  const myAddress = useMyMainAddress()

  const { data: refStats } = getUserReferralStatsQuery.useQuery(myAddress || '')
  const { refCount } = refStats || {}

  const { data: claimTaskTokensError } =
    getGamificationTasksErrorQuery.useQuery('error')
  const closeModal = () => {
    setIsOpenAnimation(false)
    close()
  }

  const {
    image: taskImage,
    steps,
    stepsWithOrangeText,
    title,
  } = modalConfigByVariant[task.name](task)

  const reward = formatNumber(parseInt(task?.rewardPoints ?? '0'))

  const {
    mutate: claimTaskTokens,
    error,
    isLoading: isClaimLoading,
  } = useClaimTaskTokens()

  useEffect(() => {
    if (!!claimTaskTokensError) setLoading(false)

    if (claimTaskTokensError === 'None') {
      setIsOpenAnimation(true)
      getGamificationTasksQuery.invalidate(client, {
        address: myAddress ?? '',
        rootSpaceId: '',
      })
      getBalanceQuery.invalidate(client, myAddress)
    }
  }, [claimTaskTokensError, client, myAddress])

  useEffect(() => {
    let timeoutId: any = null
    if (loading) {
      timeoutId = setTimeout(() => {
        setLoading(false)
      }, 10000)

      return
    }

    return () => {
      setLoading(false)
      timeoutId && clearTimeout(timeoutId)
    }
  }, [loading, claimTaskTokensError])

  useToastError(error, 'Failed to claim task tokens')

  let disableButton = false
  if (
    task.name === GamificationTaskName.InviteReferrals &&
    task.metadata?.referralsNumberToAchieve
  ) {
    disableButton =
      refCount !== undefined
        ? refCount < task.metadata.referralsNumberToAchieve
        : false
  }

  return createPortal(
    <>
      <Transition
        show={isOpen}
        appear
        as='div'
        className='fixed inset-0 z-40 h-full w-full bg-black/50 backdrop-blur-md transition duration-300'
        enterFrom={cx('opacity-0')}
        enterTo='opacity-100'
        leaveFrom='h-auto'
        leaveTo='opacity-0 !duration-150'
        onClick={close}
      />
      {isOpenAnimation && isOpen && (
        <TasksRewardsModal reward={reward} close={closeModal} />
      )}
      <Transition
        show={isOpen && !isOpenAnimation}
        appear
        as='div'
        className='fixed bottom-0 left-1/2 z-40 mx-auto flex h-auto max-h-full w-full max-w-screen-md -translate-x-1/2 overflow-y-auto rounded-t-[10px] bg-background-light outline-none transition duration-300'
        enterFrom={cx('opacity-0 translate-y-48')}
        enterTo='opacity-100 translate-y-0'
        leaveFrom='h-auto'
        leaveTo='opacity-0 translate-y-24 !duration-150'
      >
        <Button
          size='circleSm'
          variant='transparent'
          className='absolute right-4 top-4'
          onClick={close}
        >
          <HiXMark className='text-lg' />
        </Button>
        <div className='mx-auto flex w-full max-w-screen-md flex-col gap-6 overflow-auto px-5 py-6 pb-12'>
          <div className='flex flex-col gap-2'>
            <span className='text-2xl font-medium'>Tasks</span>
          </div>
          <div className='flex w-full flex-col gap-6'>
            <div className='flex w-full flex-col items-center gap-6'>
              <Image src={taskImage} alt='' className='h-[100px] w-[100px]' />
              <span className='flex items-center gap-1 text-lg font-medium leading-none'>
                <Image src={Diamond} alt='' className='h-6 w-6' /> +{reward}
              </span>
              <span className='text-[22px] font-bold leading-none'>
                {title}
              </span>
            </div>
            <div className='flex flex-col gap-6 rounded-[20px] bg-slate-700 p-4'>
              {steps.map((step, index) => (
                <div key={index} className='relative flex items-center gap-2'>
                  <div
                    className={cx(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      'border border-slate-500 bg-slate-600 font-bold',
                      stepsWithOrangeText?.includes(index) && 'text-orange-400'
                    )}
                  >
                    {index + 1}
                  </div>
                  {step}
                  {index !== steps.length - 1 && (
                    <VerticalStepsDots className='absolute left-5 top-[46px]' />
                  )}
                </div>
              ))}
            </div>
            {!!claimTaskTokensError &&
              claimTaskTokensError ===
                'GAMIFICATION_TASK_CLAIM_FAILED_NOT_COMPLETED' && (
                <div className='flex items-center gap-4 rounded-2xl bg-[#EF444433]/20 p-4'>
                  <Image
                    src={WarningIcon}
                    alt=''
                    className='h-[30px] w-[30px]'
                  />
                  <span className='flex-1 text-sm font-medium leading-[normal] text-red-300'>
                    Looks like you haven’t completed the required action.
                    Complete the task to continue.
                  </span>
                </div>
              )}
            <Button
              variant='primary'
              size='lg'
              disabled={disableButton}
              isLoading={isClaimLoading || loading}
              loadingText='Checking...'
              onClick={async () => {
                setLoading(true)
                clearGamificationTasksError(client)

                claimTaskTokens({ taskTag: task.tag })
              }}
            >
              Check the task
            </Button>
          </div>
        </div>
      </Transition>
    </>,
    document.body
  )
}

export default ClaimTaskModal
