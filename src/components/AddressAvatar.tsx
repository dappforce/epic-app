import useRandomColor from '@/hooks/useRandomColor'
import useTgLink from '@/hooks/useTgLink'
import { getProfileQuery } from '@/services/datahub/profiles/query'
import { useProfilePostsModal } from '@/stores/profile-posts-modal'
import { cx } from '@/utils/class-names'
import { getIpfsContentUrl } from '@/utils/ipfs'
import { decodeProfileSource } from '@/utils/profile'
import dynamic from 'next/dynamic'
import Image, { ImageProps } from 'next/image'
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { z } from 'zod'
import { ForceProfileSource } from './ProfilePreview'
import PopOver from './floating/PopOver'
import CustomLink from './referral/CustomLink'

const RandomAvatar = dynamic(() => import('./RandomAvatar'), {
  ssr: false,
})

export const resolveEnsAvatarSrc = (ensName: string) =>
  `https://euc.li/${ensName}`

export type AddressAvatarProps = ComponentProps<'div'> & {
  address: string
  asLink?: boolean
  forceProfileSource?: ForceProfileSource
  loading?: ImageProps['loading']
  withProfileModal?: boolean
}

const AddressAvatar = forwardRef<HTMLDivElement, AddressAvatarProps>(
  function AddressAvatar(
    {
      address,
      forceProfileSource,
      asLink,
      withProfileModal = true,
      loading,
      ...props
    }: AddressAvatarProps,
    ref
  ) {
    const backgroundColor = useRandomColor(address)
    const { openModal } = useProfilePostsModal()

    const [isAvatarError, setIsAvatarError] = useState(false)
    const onImageError = useCallback(() => setIsAvatarError(true), [])
    const { telegramLink } = useTgLink(address, asLink)

    const { data: profile, isLoading } = getProfileQuery.useQuery(address)

    const profileSource = profile?.profileSpace?.content?.profileSource
    const subsocialProfileImage = profile?.profileSpace?.content?.image
    const profileAvatar = useMemo(() => {
      if (forceProfileSource?.content?.image)
        return getIpfsContentUrl(forceProfileSource.content.image)

      const { source } = decodeProfileSource(profileSource)
      const usedProfileSource = forceProfileSource?.profileSource || source
      switch (usedProfileSource) {
        case 'subsocial-profile':
          return subsocialProfileImage
            ? getIpfsContentUrl(subsocialProfileImage)
            : undefined
      }
    }, [
      profileSource,
      forceProfileSource?.profileSource,
      forceProfileSource?.content,
      subsocialProfileImage,
    ])

    useEffect(() => {
      setIsAvatarError(false)
    }, [profileAvatar])

    if (isLoading) {
      return (
        <div
          className={cx(
            'relative flex flex-shrink-0 animate-pulse items-stretch gap-2.5 overflow-hidden outline-none'
          )}
        >
          <div
            style={{ backgroundClip: 'padding-box' }}
            className={cx(
              'bg-background-lighter/50',
              'rounded-full',
              'h-9 w-9 self-center',
              props.className
            )}
          ></div>
        </div>
      )
    }

    return (
      <LinkOrText
        {...props}
        href={telegramLink}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()

          withProfileModal && openModal({ address })
          props.onClick?.(e as any)
        }}
        ref={ref as any}
        className={cx(
          'relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-background-lightest',
          { ['cursor-pointer']: withProfileModal },
          props.className
        )}
        style={{ backgroundColor }}
      >
        {profileAvatar && z.string().url().safeParse(profileAvatar).success && (
          <div
            className={cx(
              'absolute inset-0 h-full w-full transition-opacity',
              !isAvatarError ? 'z-[1] opacity-100' : '-z-[1] opacity-0'
            )}
          >
            <div className='relative h-full w-full'>
              <Image
                loading={loading}
                width={500}
                height={500}
                className={cx(
                  'relative h-full w-full rounded-full object-cover',
                  props.className
                )}
                src={profileAvatar}
                onError={onImageError}
                alt='avatar'
              />
            </div>
          </div>
        )}

        <div className={cx('relative h-full w-full')}>
          <RandomAvatar
            value={address}
            className='h-full w-full !cursor-[inherit]'
          />
        </div>
      </LinkOrText>
    )
  }
)

const LinkOrText = forwardRef<
  any,
  ComponentPropsWithoutRef<'span'> & { href?: string }
>(({ href, ...props }, ref) => {
  if (href) {
    return (
      <PopOver
        trigger={
          <CustomLink href={href} forceHardNavigation {...props} ref={ref} />
        }
        panelSize='sm'
        triggerOnHover
        placement='top'
        yOffset={6}
      >
        <span>Message user</span>
      </PopOver>
    )
  }
  return <div {...props} ref={ref} />
})
LinkOrText.displayName = 'LinkOrText'

export default AddressAvatar
