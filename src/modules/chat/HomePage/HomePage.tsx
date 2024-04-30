import Container from '@/components/Container'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import ChatContent from './ChatContent'
import MainContent from './MainContent'

export type HomePageProps = {}

export default function HomePage(props: HomePageProps) {
  return (
    <DefaultLayout withSidebar>
      <Container className='grid grid-cols-1 gap-4 px-4 lg:grid-cols-[1fr_325px] xl:grid-cols-[1fr_375px]'>
        <MainContent />
        <ChatContent />
      </Container>
    </DefaultLayout>
  )
}
