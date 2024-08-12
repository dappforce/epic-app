import Logo from '@/components/Logo'

export default function MaintenancePage() {
  return (
    <div className='flex h-screen w-full items-center justify-center bg-background px-8 text-center'>
      <div className='flex flex-col gap-8'>
        <Logo className='text-5xl' />
        <div className='flex max-w-screen-sm flex-col gap-4'>
          <p className='text-2xl font-semibold'>🛠️ Short Meme Break 🛠️</p>
          <p className='text-text-muted'>
            Our site is taking a quick breather while we improve your
            meme-sharing experience! 💻
          </p>
          <p className='mt-2 text-text-muted'>
            Don&apos;t worry, your amazing content is safe, and we&apos;ll be
            back up and running before you know it. Hang tight and get ready to
            unleash your next viral hit! 🌟
          </p>
        </div>
      </div>
    </div>
  )
}
