import { ActionCardProps } from '@/components/ActionCard'
import PluralText from '@/components/PluralText'
import ProfilePreview from '@/components/ProfilePreview'
import ProfilePreviewModalWrapper from '@/components/ProfilePreviewModalWrapper'
import TruncatedText from '@/components/TruncatedText'
import ChatHiddenChip from '@/components/chats/ChatHiddenChip'
import NewCommunityModal from '@/components/community/NewCommunityModal'
import ModerationInfoModal from '@/components/moderation/ModerationInfoModal'
import { useReferralSearchParam } from '@/components/referral/ReferralUrlChanger'
import { isCommunityHubId } from '@/constants/config'
import { env } from '@/env.mjs'
import useAuthorizedForModeration from '@/hooks/useAuthorizedForModeration'
import useIsInIframe from '@/hooks/useIsInIframe'
import { getPostQuery } from '@/services/api/query'
import { getSpaceQuery } from '@/services/datahub/spaces/query'
import { useHideUnhidePost } from '@/services/subsocial/posts/mutation'
import { useSendEvent } from '@/stores/analytics'
import { useCreateChatModal } from '@/stores/create-chat-modal'
import { useMyMainAddress } from '@/stores/my-account'
import { cx } from '@/utils/class-names'
import { getChatPageLink, getCurrentUrlOrigin } from '@/utils/links'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash, HiQrCode } from 'react-icons/hi2'
import { LuPencil, LuShield } from 'react-icons/lu'
import { RiDatabase2Line } from 'react-icons/ri'
import urlJoin from 'url-join'
import ConfirmationModal from '../ConfirmationModal'
import MetadataModal from '../MetadataModal'
import { ModalFunctionalityProps } from '../Modal'
import QrCodeModal from '../QrCodeModal'
import AboutModal, { AboutModalProps } from './AboutModal'

export type AboutChatModalProps = ModalFunctionalityProps & {
  chatId: string
  messageCount?: number
}

type InnerModalType =
  | 'metadata'
  | 'qr'
  | 'confirmation-leave'
  | 'edit'
  | 'hide'
  | 'unhide'
  | 'moderation'
  | null

export default function AboutChatModal({
  chatId,
  messageCount = 0,
  ...props
}: AboutChatModalProps) {
  const { isAuthorized } = useAuthorizedForModeration(chatId)
  const address = useMyMainAddress()
  const router = useRouter()
  const { data: chat } = getPostQuery.useQuery(chatId, {
    showHiddenPost: { type: 'all' },
  })
  const { data: space } = getSpaceQuery.useQuery(chat?.struct.spaceId || '')
  const { openModal, closeModal: closeCreateChatModal } = useCreateChatModal()
  const sendEvent = useSendEvent()
  const refSearchParam = useReferralSearchParam()

  const [openedModalType, setOpenedModalType] = useState<InnerModalType>(null)
  const { mutate: hideUnhidePost, isLoading: isHiding } = useHideUnhidePost()

  const isInIframe = useIsInIframe()

  const content = chat?.content
  if (!content) return null

  const hubId = chat.struct.spaceId
  const chatUrl = urlJoin(
    getCurrentUrlOrigin(),
    env.NEXT_PUBLIC_BASE_PATH,
    getChatPageLink(router),
    refSearchParam
  )
  const chatOwner = chat.struct.ownerId
  const isChatInsideCommunityHub = isCommunityHubId(hubId)

  const contentList: AboutModalProps['contentList'] = [
    {
      title: 'Description',
      content: content.body && <TruncatedText text={content.body} />,
    },
    {
      title: 'Chat link',
      content: chatUrl,
      textToCopy: chatUrl,
      redirectTo: chatUrl,
      openInNewTab: true,
    },
  ]
  if (isChatInsideCommunityHub) {
    contentList.push({
      title: 'Chat owner',
      content: (
        <ProfilePreviewModalWrapper address={chatOwner}>
          {(onClick) => (
            <ProfilePreview
              onClick={onClick}
              address={chatOwner}
              className='relative -left-0.5 mt-1 cursor-pointer gap-0.5'
              avatarClassName={cx('h-6 w-6')}
              showAddress={false}
              nameClassName='text-base'
            />
          )}
        </ProfilePreviewModalWrapper>
      ),
    })
  }
  const closeModal = () => setOpenedModalType(null)

  const getActionMenu = () => {
    const actionMenu: AboutModalProps['actionMenu'] = [
      {
        text: 'Show QR code',
        iconClassName: 'text-text-muted',
        icon: HiQrCode,
        onClick: () => setOpenedModalType('qr'),
      },
      {
        text: 'Show Metadata',
        iconClassName: cx('text-text-muted'),
        icon: RiDatabase2Line,
        onClick: () => setOpenedModalType('metadata'),
      },
    ]

    const additionalMenus: ActionCardProps['actions'] = []
    if (isAuthorized) {
      additionalMenus.push({
        text: 'Moderation',
        icon: LuShield,
        iconClassName: cx('text-text-muted'),
        onClick: () => setOpenedModalType('moderation'),
      })
    }
    if (chatOwner === address) {
      additionalMenus.push({
        text: 'Edit',
        icon: LuPencil,
        iconClassName: cx('text-text-muted'),
        onClick: () => {
          setOpenedModalType('edit')
          openModal({ defaultOpenState: 'update-chat' })
          sendEvent('click edit_chat_menu')
        },
      })

      if (chat.struct.hidden) {
        additionalMenus.push({
          text: 'Unhide Chat',
          icon: HiOutlineEye,
          iconClassName: cx('text-text-muted'),
          onClick: () => {
            setOpenedModalType('unhide')
            sendEvent('click unhide_chat_menu')
          },
        })
      } else {
        additionalMenus.push({
          text: 'Hide Chat',
          icon: HiOutlineEyeSlash,
          iconClassName: cx('text-text-muted'),
          onClick: () => {
            setOpenedModalType('hide')
            sendEvent('click hide_chat_menu')
          },
        })
      }
    }

    actionMenu.unshift(...additionalMenus)

    if (isInIframe) return actionMenu
    return actionMenu
  }

  let subtitle = (
    <span>
      {messageCount}{' '}
      <PluralText count={messageCount} plural='messages' singular='message' />
    </span>
  )
  const membersCount = chat.struct.followersCount ?? 0
  if (membersCount) {
    subtitle = (
      <span>
        <span>
          {membersCount}{' '}
          <PluralText count={membersCount} plural='members' singular='member' />
        </span>{' '}
        <span className='mx-1'>·</span> {subtitle}
      </span>
    )
  }

  return (
    <>
      <AboutModal
        {...props}
        id={chat.id}
        isOpen={props.isOpen && openedModalType === null}
        entityTitle={content?.title}
        modalTitle={
          <span>
            <span>{content?.title}</span>
            {chat.struct.hidden && (
              <ChatHiddenChip
                popOverProps={{
                  triggerClassName: 'inline ml-2',
                  placement: 'top-end',
                }}
                className='inline-flex'
              />
            )}
          </span>
        }
        subtitle={subtitle}
        actionMenu={getActionMenu()}
        contentList={contentList}
        image={content?.image}
      />

      <MetadataModal
        onBackClick={closeModal}
        closeModal={closeModal}
        isOpen={openedModalType === 'metadata'}
        entity={chat}
        postIdTextPrefix='Chat'
      />
      <QrCodeModal
        isOpen={openedModalType === 'qr'}
        closeModal={closeModal}
        title='Chat QR Code'
        description='You can use this QR code to quickly share the chat with anyone.'
        withCloseButton
        onBackClick={closeModal}
        url={chatUrl}
        urlTitle={content.title}
      />
      <NewCommunityModal
        chat={chat}
        onBackClick={() => {
          closeCreateChatModal()
          setOpenedModalType(null)
        }}
        customOnClose={() => {
          setOpenedModalType(null)
          closeModal()
        }}
        onSuccess={() => {
          closeCreateChatModal()
          setOpenedModalType(null)
        }}
      />
      {hubId && (
        <ModerationInfoModal
          hubId={hubId}
          isOpen={openedModalType === 'moderation'}
          closeModal={closeModal}
          onBackClick={closeModal}
          chatId={chatId}
        />
      )}
      <ConfirmationModal
        isOpen={openedModalType === 'hide'}
        title='🤔 Make this chat hidden?'
        closeModal={closeModal}
        primaryButtonProps={{ children: 'No, keep it public' }}
        secondaryButtonProps={{
          children: 'Yes, hide this chat',
          isLoading: isHiding,
          onClick: () => {
            hideUnhidePost({ postId: chatId, action: 'hide' })
          },
        }}
      />
      <ConfirmationModal
        isOpen={openedModalType === 'unhide'}
        title='🤔 Make this chat public?'
        closeModal={closeModal}
        primaryButtonProps={{ children: 'No, keep it hidden' }}
        secondaryButtonProps={{
          children: 'Yes, make it public',
          isLoading: isHiding,
          onClick: () => {
            hideUnhidePost({ postId: chatId, action: 'unhide' })
          },
        }}
      />
    </>
  )
}
