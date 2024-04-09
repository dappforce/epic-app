import Button from '@/components/Button'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import ProposalStatus from '@/components/opengov/ProposalStatus'
import VoteSummary from '@/components/opengov/VoteSummary'
import { Proposal } from '@/server/opengov/mapper'
import { cx } from '@/utils/class-names'
import { formatBalanceWithDecimals } from '@/utils/formatBalance'
import { Resource } from '@subsocial/resource-discussions'
import { ReactNode, useState } from 'react'
import DesktopProposalDetail from './DesktopProposalDetail'
import MobileProposalDetailPage from './MobileProposalDetail'
import ProposalDetailModal from './ProposalDetailModal'

export type ProposalDetailPageProps = {
  proposal: Proposal
  chatId: string | null
}

export function getProposalResourceId(proposalId: number | string) {
  return new Resource({
    chainName: 'polkadot',
    chainType: 'substrate',
    resourceType: 'proposal',
    resourceValue: {
      id: proposalId.toString(),
    },
    schema: 'chain',
  }).toResourceId()
}

export default function ProposalDetailPage(props: ProposalDetailPageProps) {
  return (
    <DefaultLayout
      navbarProps={{
        withLargerContainer: true,
        backButtonProps: {
          defaultBackLink: '/opengov',
          forceUseDefaultBackLink: false,
        },
        customContent: ({ backButton, authComponent, notificationBell }) => (
          <div className='flex w-full items-center justify-between gap-4 overflow-hidden'>
            <NavbarChatInfo backButton={backButton} proposal={props.proposal} />
            <div className='flex items-center gap-3'>
              {notificationBell}
              {authComponent}
            </div>
          </div>
        ),
      }}
    >
      <MobileProposalDetailPage {...props} className='lg:hidden' />
      <DesktopProposalDetail {...props} className='hidden lg:grid' />
    </DefaultLayout>
  )
}

function NavbarChatInfo({
  proposal,
  backButton,
}: {
  proposal: Proposal
  backButton: ReactNode
}) {
  const [isOpenModal, setIsOpenModal] = useState(false)

  return (
    <div className='flex flex-1 items-center overflow-hidden'>
      {backButton}
      <Button
        variant='transparent'
        interactive='none'
        size='noPadding'
        className={cx(
          'flex flex-1 cursor-pointer items-center gap-2 overflow-hidden rounded-none text-left'
        )}
        onClick={() => {
          setIsOpenModal(true)
        }}
      >
        <VoteSummary proposal={proposal} className='h-10 w-10' type='small' />
        <div className='flex flex-col overflow-hidden'>
          <div className='flex items-center gap-2 overflow-hidden'>
            <span className='overflow-hidden overflow-ellipsis whitespace-nowrap font-medium'>
              {proposal.title}
            </span>
          </div>
          <span className='overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-text-muted'>
            {formatBalanceWithDecimals(proposal.requested)} DOT &middot;{' '}
            <ProposalStatus proposal={proposal} />
          </span>
        </div>
      </Button>
      <ProposalDetailModal
        isOpen={isOpenModal}
        closeModal={() => setIsOpenModal(false)}
        proposal={proposal}
      />
    </div>
  )
}
