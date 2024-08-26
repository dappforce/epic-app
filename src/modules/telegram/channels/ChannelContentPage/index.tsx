import DummyImage from '@/assets/graphics/landing/testimonials/dogstreet.png'
import Pepe from '@/assets/graphics/pepe-dummy.png'
import Container from '@/components/Container'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import TabButtons from '@/components/TabButtons'
import ChatContent from '@/modules/chat/HomePage/ChatContent'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { FaChevronLeft } from 'react-icons/fa6'

export default function ChannelContentPage() {
  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <ChannelNavbar />
      <ChatContent />
    </LayoutWithBottomNavigation>
  )
}

function ChannelNavbar({}: {}) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('Details')
  const router = useRouter()

  return (
    <>
      <nav className='flex h-14 items-center gap-2.5 bg-background-light px-3'>
        <FaChevronLeft
          onClick={() => {
            if (isAboutOpen) setIsAboutOpen(false)
            else router.push('/tg/channels')
          }}
          className='text-lg text-text-muted'
        />
        <div
          className='flex items-center gap-2.5'
          onClick={() => setIsAboutOpen(true)}
        >
          <Image src={DummyImage} alt='' className='h-9 w-9 rounded-full' />
          <span className='font-bold'>
            {isAboutOpen && 'About '}PEPE Channel
          </span>
        </div>
        {!isAboutOpen && (
          <AiOutlineInfoCircle
            onClick={() => setIsAboutOpen(true)}
            className='ml-auto text-xl text-text-muted'
          />
        )}
      </nav>
      <Transition show={isAboutOpen}>
        <div className='absolute top-14 z-10 h-full w-full bg-background transition data-[closed]:translate-x-1/2 data-[closed]:opacity-0'>
          <div className='relative mb-10 h-40 w-full'>
            <div className='h-full w-full overflow-clip'>
              <Image
                src={Pepe}
                alt=''
                className='h-full w-full scale-125 object-cover'
              />
            </div>
            <div className='absolute inset-x-0 bottom-0 h-10 w-full bg-gradient-to-b from-transparent to-background' />
            <div className='absolute bottom-0 left-2 translate-y-1/2 rounded-full bg-background p-1'>
              <Image
                src={Pepe}
                className='h-[90px] w-[90px] rounded-full object-cover'
                alt=''
              />
            </div>
          </div>
          <Container className='flex flex-col pt-6'>
            <span className='text-2xl font-bold'>PEPE Channel</span>
            <TabButtons
              className='mt-6'
              tabs={['Details', 'Tasks']}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            <div className='py-4'>
              {selectedTab === 'Details' && (
                <p className='whitespace-pre-wrap leading-snug text-text-muted'>
                  {`Pepe is tired of watching everyone play hot potato with the endless derivative ShibaCumGMElonKishuTurboAssFlokiMoon Inu coins. The Inu’s have had their day. It’s time for the most recognizable meme in the world to take his reign as king of the internet.

Pepe is here to make memecoins great again. Launched stealth with no presale, zero taxes, LP burnt and contract renounced, $PEPE is a coin for the people, forever. Fueled by pure memetic power, let $PEPE show you the way.`}
                </p>
              )}
            </div>
          </Container>
        </div>
      </Transition>
    </>
  )
}
