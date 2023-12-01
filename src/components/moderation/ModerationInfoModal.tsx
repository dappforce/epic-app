import BlockedImage from '@/assets/graphics/blocked.png'
import useAuthorizedForModeration from '@/hooks/useAuthorizedForModeration'
import { getPostQuery } from '@/services/api/query'
import { GetBlockedInAppDetailedQuery } from '@/services/datahub/generated-query'
import { useModerationActions } from '@/services/datahub/moderation/mutation'
import {
  getBlockedInAppDetailedQuery,
  getBlockedInPostIdDetailedQuery,
} from '@/services/datahub/moderation/query'
import { useMyMainAddress } from '@/stores/my-account'
import Image from 'next/image'
import { useReducer } from 'react'
import { toast } from 'react-hot-toast'
import { HiOutlineInformationCircle, HiXMark } from 'react-icons/hi2'
import AddressAvatar from '../AddressAvatar'
import Button from '../Button'
import DataCard, { DataCardProps } from '../DataCard'
import ConfirmationModal from '../modals/ConfirmationModal'
import Modal, { ModalFunctionalityProps } from '../modals/Modal'
import Name, { useName } from '../Name'
import { Skeleton } from '../SkeletonFallback'
import Toast from '../Toast'

export type ModerationInfoModalProps = ModalFunctionalityProps & {
  chatId: string
  hubId: string
}

type ConfirmationModalState = {
  isOpenConfirmation: boolean
  toBeUnblocked: {
    id: string
    reasonText: string
  } | null
}
type ConfirmationModalAction =
  | {
      type: 'open'
      payload: ConfirmationModalState['toBeUnblocked']
    }
  | { type: 'close' }

export default function ModerationInfoModal({
  chatId,
  hubId,
  ...props
}: ModerationInfoModalProps) {
  const myAddress = useMyMainAddress()
  const [{ isOpenConfirmation, toBeUnblocked }, dispatch] = useReducer(
    (state: ConfirmationModalState, action: ConfirmationModalAction) => {
      switch (action.type) {
        case 'open':
          return {
            isOpenConfirmation: true,
            toBeUnblocked: action.payload,
          }
        case 'close':
          return {
            ...state,
            isOpenConfirmation: false,
          }
      }
    },
    {
      isOpenConfirmation: false,
      toBeUnblocked: null,
    }
  )

  const { isAdmin } = useAuthorizedForModeration(chatId)

  const { data: chat } = getPostQuery.useQuery(chatId)
  const chatEntityId = chat?.entityId ?? ''

  const { data: blockedInPost, isLoading } =
    getBlockedInPostIdDetailedQuery.useQuery(chatEntityId, {
      enabled: props.isOpen,
    })
  const { data: blockedInApp } = getBlockedInAppDetailedQuery.useQuery(null)

  const blockedUsersCount =
    (blockedInPost?.address.length ?? 0) + (blockedInApp?.address.length ?? 0)

  const { name } = useName(toBeUnblocked?.id ?? '')
  const { mutateAsync } = useModerationActions({
    onSuccess: (_, variables) => {
      if (variables.callName === 'synth_moderation_unblock_resource') {
        toast.custom((t) => (
          <Toast
            icon={(classNames) => (
              <HiOutlineInformationCircle className={classNames} />
            )}
            t={t}
            title={`You have unblocked the user ${name}`}
          />
        ))
      }
    },
  })

  if (!myAddress) return null

  const cardMapper = (
    blockedData: GetBlockedInAppDetailedQuery['moderationBlockedResourcesDetailed'][number],
    isAppBlockedData?: boolean
  ) => {
    const address = blockedData.resourceId
    const reasonText = blockedData.reason.reasonText
    return {
      title: address,
      customContent: (
        <DataCardContent
          address={address}
          reasonText={reasonText}
          onUnblock={
            !isAppBlockedData || isAdmin
              ? () =>
                  dispatch({
                    type: 'open',
                    payload: {
                      id: address,
                      reasonText,
                    },
                  })
              : undefined
          }
        />
      ),
    }
  }

  const blockedInPostCard: DataCardProps['data'] = (
    blockedInPost?.address ?? []
  ).map((data) => cardMapper(data))
  const blockedInAppCard: DataCardProps['data'] = (
    blockedInApp?.address ?? []
  ).map((data) => cardMapper(data, true))

  const allCardData = blockedInPostCard
  if (isAdmin) {
    allCardData.unshift(...blockedInAppCard)
  } else {
    allCardData.push(...blockedInAppCard)
  }

  const unblock = async () => {
    if (!toBeUnblocked) return
    await mutateAsync({
      callName: 'synth_moderation_unblock_resource',
      args: {
        resourceId: toBeUnblocked.id,
        ctxPostIds: ['*'],
        ctxAppIds: ['*'],
      },
    })
  }

  return (
    <>
      <Modal
        {...props}
        isOpen={props.isOpen && !isOpenConfirmation}
        title='🛡 Moderation'
        description='Moderated content will not be deleted from the blockchain but be hidden from the other users in Grill.chat.'
      >
        <div className='flex flex-col gap-2'>
          <span className='text-sm text-text-muted'>
            Blocked users ({blockedUsersCount})
          </span>
          {isLoading ? (
            <Skeleton className='h-40 w-full rounded-2xl' />
          ) : (
            <div className='overflow-hidden rounded-2xl bg-background-lighter px-4 pr-1'>
              {blockedUsersCount ? (
                <DataCard
                  className='max-h-96 overflow-y-scroll rounded-none p-0 py-4 pr-1 scrollbar-track-background-lighter scrollbar-thumb-background-lightest/70'
                  data={allCardData}
                />
              ) : (
                <div className='flex flex-col items-center gap-4 py-4 text-center'>
                  <Image src={BlockedImage} alt='' />
                  <span className='text-text-muted'>
                    There&apos;re no blocked users yet.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
      <ConfirmationModal
        isOpen={isOpenConfirmation}
        closeModal={() => dispatch({ type: 'close' })}
        title='🤔 Unblock user'
        primaryButtonProps={{ children: 'Yes, unblock', onClick: unblock }}
        secondaryButtonProps={{ children: 'No, keep blocked' }}
        content={() => {
          if (!toBeUnblocked) return null
          return (
            <DataCard
              data={[
                {
                  title: toBeUnblocked?.id,
                  customContent: (
                    <DataCardContent
                      address={toBeUnblocked.id}
                      reasonText={toBeUnblocked.reasonText}
                    />
                  ),
                },
              ]}
            />
          )
        }}
      />
    </>
  )
}

function DataCardContent({
  address,
  reasonText,
  onUnblock,
}: {
  address: string
  reasonText: string
  onUnblock?: () => void
}) {
  return (
    <div className='flex items-center gap-2'>
      <AddressAvatar address={address} />
      <div className='flex flex-1 flex-col gap-0.5'>
        <Name address={address} showProfileSourceIcon={false} />
        <span className='text-sm text-text-muted'>{reasonText}</span>
      </div>
      {onUnblock && (
        <Button
          size='noPadding'
          variant='transparent'
          className='text-2xl'
          onClick={onUnblock}
        >
          <HiXMark />
        </Button>
      )}
    </div>
  )
}
