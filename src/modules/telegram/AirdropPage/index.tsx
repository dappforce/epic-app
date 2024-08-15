import Tokens from '@/assets/graphics/airdrop/tokens.png'
import BlueGradient from '@/assets/graphics/blue-gradient.png'
import BackButton from '@/components/layouts/BackButton'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import LinkEvmAddressModal from '@/components/modals/LinkEvmAddressModal'
import SubsocialProfileModal from '@/components/subsocial-profile/SubsocialProfileModal'
import useTgNoScroll from '@/hooks/useTgNoScroll'
import Image from 'next/image'
import { useState } from 'react'
import RemoveLinkedIdentityModal from './RemoveLinkedIdentityModal'

export default function AirdropPage() {
  useTgNoScroll()

  const [isOpenRemoveAccountModal, setIsOpenRemoveAccountModal] =
    useState(false)
  const [openProfileModal, setOpenProfileModal] = useState(false)
  const [openEvmLinkModal, setOpenEvmLinkModal] = useState(false)

  return (
    <LayoutWithBottomNavigation
      withFixedHeight
      className='relative'
      pageNavigation={{ title: 'Airdrop', backLink: '/tg/menu' }}
    >
      <Image
        src={BlueGradient}
        priority
        alt=''
        className='absolute -top-[0] left-1/2 z-0 w-full -translate-x-1/2'
      />
      <div className='flex flex-1 flex-col gap-4 overflow-auto'>
        <BackButton title='Airdrop' backPath='/tg/menu' className='mt-4 px-4' />
        <div className='flex flex-col'>
          <TokenGraphics />
          <div className='-mt-2 flex flex-col gap-2 text-center'>
            <span className='text-lg font-semibold'>Rewards soon</span>
            <span className='px-4 text-text-muted'>
              Points are in-app rewards exchangeable for something really cool
              later
            </span>
          </div>
        </div>
      </div>
      <RemoveLinkedIdentityModal
        isOpen={isOpenRemoveAccountModal}
        closeModal={() => setIsOpenRemoveAccountModal(false)}
      />
      <SubsocialProfileModal
        title='✏️ Edit Profile'
        closeModal={() => setOpenProfileModal(false)}
        isOpen={openProfileModal}
      />
      <LinkEvmAddressModal
        isOpen={openEvmLinkModal}
        closeModal={() => setOpenEvmLinkModal(false)}
      />
    </LayoutWithBottomNavigation>
  )
}

function TokenGraphics() {
  return (
    <div className='relative overflow-clip'>
      <Image src={Tokens} alt='' />
    </div>
  )
}
