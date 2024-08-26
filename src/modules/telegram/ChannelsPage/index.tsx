import BlueGradient from '@/assets/graphics/blue-gradient.png'
import Author1 from '@/assets/graphics/landing/testimonials/alberdioni8406.png'
import Author2 from '@/assets/graphics/landing/testimonials/dogstreet.png'
import Meme1 from '@/assets/graphics/memes/check-1.jpeg'
import Meme2 from '@/assets/graphics/memes/check-2.jpeg'
import Container from '@/components/Container'
import MediaLoader from '@/components/MediaLoader'
import LayoutWithBottomNavigation from '@/components/layouts/LayoutWithBottomNavigation'
import PointsWidget from '@/modules/points/PointsWidget'
import { cx } from '@/utils/class-names'
import Image, { ImageProps } from 'next/image'
import { FaChevronRight } from 'react-icons/fa6'

export default function ChannelsPage() {
  return (
    <LayoutWithBottomNavigation withFixedHeight className='relative'>
      <PointsWidget isNoTgScroll className='sticky top-0' />
      <Container as='div' className='relative pt-4'>
        <Image
          src={BlueGradient}
          alt=''
          className='absolute left-0 top-0 w-full'
        />
        <div className='relative flex flex-col gap-4'>
          <TopMemesToday />
          <ChannelsList />
        </div>
      </Container>
    </LayoutWithBottomNavigation>
  )
}

function ChannelsList() {
  return (
    <div className='flex flex-col gap-2'>
      <Channel />
      <Channel />
      <Channel />
      <Channel />
    </div>
  )
}
function Channel() {
  return (
    <div className='flex items-center gap-2.5 rounded-xl bg-background-light px-2.5 py-3.5'>
      <Image src={Author2} alt='' className='h-12 w-12 rounded-full' />
      <div className='flex flex-col gap-1.5'>
        <span className='font-bold'>General</span>
        <span className='text-sm font-medium text-text-primary'>+23 memes</span>
      </div>
      <FaChevronRight className='ml-auto mr-1.5 text-xl text-text-muted' />
    </div>
  )
}

function TopMemesToday() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-0.5'>
        <h1 className='text-lg font-bold'>Top memes today</h1>
        <span className='text-sm font-medium text-text-muted'>
          Authors of the best memes earn 💎 20,000 points
        </span>
      </div>
      <div className='grid grid-cols-2 items-center gap-3'>
        <TopMeme image={Meme1} author='Steve456' authorImage={Author1} />
        <TopMeme image={Meme2} author='Alan4' authorImage={Author2} />
      </div>
    </div>
  )
}

function TopMeme({
  author,
  image,
  authorImage,
}: {
  image: ImageProps['src']
  author: string
  authorImage: ImageProps['src']
}) {
  return (
    <div className='relative aspect-square overflow-clip rounded-xl'>
      <MediaLoader
        containerClassName={cx(
          'overflow-hidden w-full h-full cursor-pointer relative'
        )}
        placeholderClassName={cx('w-full aspect-square')}
        className='h-full w-full object-contain'
        src={image}
        enableMaxHeight={false}
      />
      <div className='absolute bottom-2.5 left-2.5 flex gap-1 rounded-full bg-background-light p-0.5 pr-1.5'>
        <Image src={authorImage} alt='' className='h-5 w-5 rounded-full' />
        <span className='text-sm font-medium'>{author}</span>
      </div>
    </div>
  )
}
