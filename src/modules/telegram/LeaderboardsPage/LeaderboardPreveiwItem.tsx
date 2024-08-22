import AddressAvatar from '@/components/AddressAvatar'
import Name from '@/components/Name'

type LeaderboardPreviewItemProps = {
  address: string
  desc?: React.ReactNode
  value: React.ReactNode
  showDivider?: boolean
}

const LeaderboardPreviewItem = ({
  address,
  desc,
  value,
  showDivider = true,
}: LeaderboardPreviewItemProps) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <AddressAvatar address={address} />
          <div className='flex flex-col gap-2'>
            <Name address={address} className='leading-none' />
            {desc}
          </div>
        </div>
        {value}
      </div>
      {showDivider && (
        <div className='ml-11 w-full border-b border-slate-700'></div>
      )}
    </div>
  )
}

export default LeaderboardPreviewItem
