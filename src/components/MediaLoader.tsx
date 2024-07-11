import { cx } from '@/utils/class-names'
import { getIpfsContentUrl } from '@/utils/ipfs'
import { validateVideoUrl } from '@/utils/links'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

export type MediaLoaderProps = Omit<ImageProps, 'src' | 'alt'> & {
  alt?: string
  src?: ImageProps['src']
  imageOnly?: boolean
  containerClassName?: string
  loadingClassName?: string
  placeholderClassName?: string
  withSpinner?: boolean
}

export default function MediaLoader({
  src,
  imageOnly,
  containerClassName,
  loadingClassName,
  placeholderClassName,
  withSpinner,
  ...props
}: MediaLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  let usedImage = src
  if (typeof src === 'string') {
    usedImage = getIpfsContentUrl(src)
  }

  const renderImageElement = () => {
    const commonClassName = cx('relative transition-opacity', props.className)

    const commonProps: any = {
      ...props,
      className: commonClassName,
      src: usedImage,
      onLoad: (e: any) => {
        setIsLoaded(true)
        props.onLoad?.(e)
      },
    }

    if (
      !imageOnly &&
      typeof usedImage === 'string' &&
      validateVideoUrl(usedImage)
    ) {
      return (
        <video
          {...commonProps}
          onLoadedData={props.onLoad}
          className={cx(commonClassName, 'aspect-square')}
          controls
          muted
        />
      )
    } else if (
      !imageOnly &&
      typeof usedImage === 'string' &&
      usedImage.startsWith('data:')
    ) {
      // width and height props will make iframe not square in clickable media
      const { width, height, ...iframeProps } = commonProps
      return (
        <>
          <iframe
            {...iframeProps}
            className={cx(commonClassName, 'aspect-square')}
          />
          <div
            {...iframeProps}
            className='absolute inset-0 z-10 h-full w-full opacity-0'
          />
        </>
      )
    } else {
      return (
        <>
          <div
            className={cx(
              commonProps.className,
              'absolute inset-0 m-0 h-full w-full animate-pulse bg-background-lighter p-0',
              isLoaded && 'hidden'
            )}
          />
          <Image
            {...commonProps}
            style={{ backfaceVisibility: 'hidden', ...commonProps.style }}
            loading='eager'
            onError={undefined}
            onLoad={undefined}
            width={10}
            height={10}
            alt={props.alt || ''}
            className={cx(
              commonProps.className,
              'absolute inset-0 m-0 h-full max-h-96 w-full scale-110 object-cover p-0 blur-lg'
            )}
          />
          <Image
            {...commonProps}
            loading='eager'
            className={cx(
              'mx-auto max-h-96 object-contain',
              commonProps.className
            )}
            style={{ backfaceVisibility: 'hidden', ...commonProps.style }}
            width={commonProps.width || 500}
            height={commonProps.height || 500}
            alt={props.alt || ''}
          />
        </>
      )
    }
  }

  const imageElement = renderImageElement()

  return (
    <div className={cx('relative', containerClassName)}>
      {src ? (
        imageElement
      ) : (
        <div
          className={cx(
            'aspect-square max-h-96 w-full animate-pulse bg-background-lighter',
            placeholderClassName
          )}
        />
      )}
    </div>
  )
}
