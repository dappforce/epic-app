import useBreakpointThreshold from '@/hooks/useBreakpointThreshold'
import useLinkedEvmAddress from '@/hooks/useLinkedEvmAddress'
import useTgLink from '@/hooks/useTgLink'
import { useMyMainAddress } from '@/stores/my-account'
import { truncateAddress } from '@/utils/account'
import { cx } from '@/utils/class-names'
import { ProfileSource } from '@/utils/profile'
import { copyToClipboard } from '@/utils/strings'
import { ProfileContent } from '@subsocial/api/types'
import { ComponentProps } from 'react'
import { LuPencil } from 'react-icons/lu'
import { MdContentCopy } from 'react-icons/md'
import { RiPencilFill } from 'react-icons/ri'
import { SiEthereum } from 'react-icons/si'
import { toast } from 'sonner'
import AddressAvatar from './AddressAvatar'
import Button from './Button'
import { CopyTextInline } from './CopyText'
import Name, { useName } from './Name'
import { Skeleton } from './SkeletonFallback'
import Toast from './Toast'
import PopOver from './floating/PopOver'

export type ForceProfileSource = {
  profileSource?: ProfileSource
  content?: ProfileContent
}

export type ProfilePreviewProps = ComponentProps<'div'> & {
  address: string
  forceProfileSource?: ForceProfileSource
  className?: string
  avatarClassName?: string
  addressesContainerClassName?: string
  showAddress?: boolean
  nameClassName?: string
  onEditClick?: () => void
  onSetRewardAddressClick?: () => void
  asLink?: boolean
  withPolkadotIdentity?: boolean
  disableEditButton?: boolean
}

const ProfilePreview = ({
  address,
  forceProfileSource,
  className,
  avatarClassName,
  disableEditButton,
  nameClassName,
  addressesContainerClassName,
  asLink,
  onEditClick,
  onSetRewardAddressClick,
  showAddress = true,
  ...props
}: ProfilePreviewProps) => {
  const mdUp = useBreakpointThreshold('md')
  const { isLoading } = useName(address)
  const myAddress = useMyMainAddress()
  const { evmAddress: linkedEvmAddress, isLoading: isLoadingEvmAddress } =
    useLinkedEvmAddress(address)

  const { telegramLink, telegramUsername } = useTgLink(address, asLink)

  const isMyAddressPart = myAddress === address ? ' my' : ''

  const editButton = mdUp ? (
    <Button
      size='circleSm'
      disabled={disableEditButton}
      variant='muted'
      onClick={onEditClick}
    >
      <RiPencilFill />
    </Button>
  ) : (
    <PopOver
      panelSize='sm'
      triggerOnHover
      placement='top'
      yOffset={6}
      trigger={
        <Button
          size='noPadding'
          className='relative top-px p-1 text-text-primary'
          variant='transparent'
          onClick={onEditClick}
          disabled={disableEditButton}
        >
          <LuPencil />
        </Button>
      }
    >
      <p>Edit my profile</p>
    </PopOver>
  )

  return (
    <div {...props} className={cx('flex items-center gap-3', className)}>
      <AddressAvatar
        asLink={asLink}
        address={address}
        className={cx(
          // if avatarClassName is provided, use it, otherwise use default size
          avatarClassName ? 'h-18 w-18' : 'md:h-18 md:w-18 h-16 w-16',
          avatarClassName
        )}
        forceProfileSource={forceProfileSource}
      />
      <div className={cx('flex flex-col gap-1', addressesContainerClassName)}>
        <div className='ml-0.5 flex items-center gap-2'>
          <Name
            asLink={asLink}
            profileSourceIconClassName='text-base'
            profileSourceIconPosition='right'
            address={address}
            className={cx('gap-2 text-lg', nameClassName)}
          />
          {telegramLink && (
            <Button
              size='circleSm'
              variant='transparent'
              className='text-text-muted'
              onClick={() => {
                copyToClipboard(`@${telegramUsername}`)
                toast.custom((t) => (
                  <Toast t={t} title='Telegram username copied!' />
                ))
              }}
            >
              <MdContentCopy />
            </Button>
          )}
          {onEditClick && !isLoading && editButton}
        </div>
        {
          isLoadingEvmAddress ? (
            <Skeleton className='w-32' />
          ) : showAddress && linkedEvmAddress ? (
            <div className='flex flex-col gap-1'>
              <div className='flex flex-row items-center gap-1.5'>
                <SiEthereum className='text-xl text-text-muted' />
                <CopyTextInline
                  text={truncateAddress(linkedEvmAddress)}
                  tooltip={`Copy${isMyAddressPart} address`}
                  textToCopy={linkedEvmAddress}
                  textClassName={cx(
                    'font-mono text-base whitespace-nowrap overflow-hidden overflow-ellipsis'
                  )}
                />
              </div>
            </div>
          ) : null
          // onSetRewardAddressClick && (
          //   <div>
          //     <Button
          //       className='mt-0.5 flex items-center gap-1.5 px-3 py-1 text-sm'
          //       size='sm'
          //       onClick={onSetRewardAddressClick}
          //     >
          //       <TbCoins />
          //       <span>Set Rewards Address</span>
          //     </Button>
          //   </div>
          // )
        }
      </div>
    </div>
  )
}

export default ProfilePreview
