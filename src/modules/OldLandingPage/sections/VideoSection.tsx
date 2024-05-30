import Diamond from '@/assets/emojis/diamond.png'
import { YoutubeEmbed } from '@/components/chats/ChatItem/Embed'
import { useSendEvent } from '@/stores/analytics'
import { cx, getBlurFallbackStyles } from '@/utils/class-names'
import Image from 'next/image'
import { ComponentProps } from 'react'
import BgGradient from '../common/BgGradient'
import Heading from '../common/Heading'
import JoinSection from './JoinSection'

export default function VideoSection(props: ComponentProps<'section'>) {
  const sendEvent = useSendEvent()
  return (
    <section
      {...props}
      className={cx('relative mx-auto max-w-6xl', props.className)}
    >
      <Image
        src={Diamond}
        alt=''
        style={getBlurFallbackStyles({
          rotate: '18deg',
          translate: { y: '-50%' },
        })}
        className='unselectable absolute -right-4 -top-4 h-24 w-24 opacity-60 blur-[3px] md:h-56 md:w-56 xl:-right-40 xl:h-56 xl:w-56'
      />
      <BgGradient
        color='dark-blue'
        className='absolute -left-20 -top-20 h-[731px] w-[731px] -translate-x-3/4'
      />
      <BgGradient
        color='purple'
        className='absolute -bottom-48 right-48 h-[731px] w-[731px] translate-x-full translate-y-full rounded-full lg:bottom-32'
      />
      <div
        className={cx(
          'relative w-full overflow-hidden rounded-3xl bg-[linear-gradient(268deg,_#3F3CD5_6.17%,_#343292_96.71%)] to-[#343292] px-6 py-7 md:pt-10'
        )}
      >
        <div className='relative flex flex-col items-center text-center'>
          <Heading className='mb-2 lg:mb-4'>How To Start Earning?</Heading>
          <span className='mb-6 text-lg text-[#FEEFFB] sm:text-xl md:mb-10'>
            Watch the short video guide
          </span>
          <YoutubeEmbed
            className='flex aspect-video h-auto w-full max-w-2xl items-center justify-center rounded-3xl bg-white/10'
            link='https://youtu.be/XsUZy5OA4gs'
            onClick={() => sendEvent('lp_start_video')}
          />
        </div>
        <JoinSection
          eventSource='video'
          className='-mx-6 -mb-7 mt-6'
          contentClassName='overflow-visible bg-none pt-0 static'
        />
      </div>
    </section>
  )
}
