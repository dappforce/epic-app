import Shield from '@/assets/icons/shield.svg'
import Button from '@/components/Button'
import LinkText from '@/components/LinkText'
import Notice from '@/components/Notice'
import ChatRoom from '@/components/chats/ChatRoom'
import Modal, { ModalFunctionalityProps } from '@/components/modals/Modal'
import { env } from '@/env.mjs'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import { useState } from 'react'
import PostMemeButton from './PostMemeButton'

export default function MemeChatRoom({
  chatId,
  shouldShowUnapproved,
  isContest,
  contentContainer,
}: {
  chatId: string
  shouldShowUnapproved: boolean
  isContest?: { isContestEnded: boolean }
  contentContainer: ContentContainer
}) {
  const [isOpenRules, setIsOpenRules] = useState(false)
  const isCannotPost = isContest?.isContestEnded || shouldShowUnapproved

  return (
    <>
      <ChatRoom
        contentContainer={contentContainer}
        chatId={chatId}
        hubId={env.NEXT_PUBLIC_MAIN_SPACE_ID}
        className='overflow-hidden'
        disableSuperLike={isContest?.isContestEnded}
        onlyDisplayUnapprovedMessages={shouldShowUnapproved}
        customAction={
          isCannotPost ? (
            <></>
          ) : (
            <div className='grid grid-cols-[max-content_1fr] gap-2 px-2'>
              <Button
                type='button'
                size='lg'
                className='flex items-center justify-center gap-2 py-2.5'
                variant='bgLighter'
                onClick={() => setIsOpenRules(true)}
              >
                {isContest ? (
                  <span className='text-text'>Contest Rules</span>
                ) : (
                  <>
                    <Shield className='text-text-muted' />
                    <span className='text-text'>Rules</span>
                  </>
                )}
              </Button>
              <PostMemeButton
                contentContainer={contentContainer}
                isContestTab={!!isContest}
                chatId={chatId}
              />
            </div>
          )
        }
      />
      <RulesModal
        isContest={!!isContest}
        isOpen={isOpenRules}
        closeModal={() => setIsOpenRules(false)}
      />
    </>
  )
}

function RulesModal({
  isContest,
  ...props
}: ModalFunctionalityProps & { isContest: boolean }) {
  return (
    <Modal {...props} title='Rules' withCloseButton>
      <div className='flex flex-col gap-6'>
        <ul className='flex list-none flex-col gap-3.5 text-text-muted'>
          {isContest ? (
            <>
              <li>🤣 Post memes only about memecoins</li>
              <li>⏰ Contest is open for 1 week</li>
              <li>🤑 300 USD in $PEPE prize pool </li>
              <li className='flex gap-1'>
                <span>🏆</span>
                <div className='flex flex-col gap-1'>
                  <span>15 winners x $20 in $PEPE:</span>
                  <span>10 chosen by most likes / 5 by EPIC</span>
                </div>
              </li>
              <li className='border border-b border-background-lighter' />
              <li>🚫 No sharing personal information</li>
              <li>🚫 No adult content</li>
              <li>🚫 No spam, no scam</li>
              <li>🚫 No violence</li>
            </>
          ) : (
            <>
              <li>🤣 Post funny memes</li>
              <li>🌟 Be polite and respect others</li>
              <li>🚫 No sharing personal information</li>
              <li>🚫 No adult content</li>
              <li>🚫 No spam, no scam</li>
              <li>🚫 No violence</li>
            </>
          )}
        </ul>
        <Notice noticeType='warning'>
          ⚠️ All those who break these rules will be banned and will lose all
          their points.
        </Notice>
        <LinkText
          variant='secondary'
          className='text-center'
          href='/legal/content-policy'
        >
          Read the detailed information
        </LinkText>
        <Button size='lg' onClick={() => props.closeModal()}>
          Got it!
        </Button>
      </div>
    </Modal>
  )
}
