import Farcaster from '@/assets/icons/farcaster.svg'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { getLinkedIdentityQuery } from '@/services/datahub/identity/query'
import { useMyGrillAddress } from '@/stores/my-account'
import { IconType } from 'react-icons'
import { FaXTwitter } from 'react-icons/fa6'
import { IoLogoGoogle } from 'react-icons/io5'
import { SiEthereum } from 'react-icons/si'

const externalProviders: {
  name: string
  icon: IconType
  shortName?: string
}[] = [
  { name: 'X', icon: FaXTwitter },
  { name: 'Google', icon: IoLogoGoogle },
  { name: 'Farcaster', icon: Farcaster },
  { name: 'EVM Address', icon: SiEthereum, shortName: 'EVM' },
]

export default function LinkedIdentitiesContent() {
  const grillAddress = useMyGrillAddress() ?? ''
  const { data: linkedIdentity } = getLinkedIdentityQuery.useQuery(grillAddress)

  return (
    <div className='flex flex-col gap-6'>
      {externalProviders.map(({ icon: Icon, name, shortName }) => (
        <div className='flex flex-col gap-2' key={name}>
          <span>{name}</span>
          <Card className='flex items-center gap-4 bg-background p-4'>
            <Icon className='flex-shrink-0 text-xl text-text-muted' />
            <span className='flex-1'>Connect your {shortName ?? name}</span>
            <Button className='flex-shrink-0' size='sm'>
              Connect
            </Button>
          </Card>
        </div>
      ))}
    </div>
  )
}
