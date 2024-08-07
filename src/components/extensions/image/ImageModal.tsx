import ImageAdd from '@/assets/icons/image-add.svg'
import Button from '@/components/Button'
import InfoPanel from '@/components/InfoPanel'
import MediaLoader, { MediaLoaderProps } from '@/components/MediaLoader'
import SkeletonFallback from '@/components/SkeletonFallback'
import Spinner from '@/components/Spinner'
import { SUPPORTED_IMAGE_EXTENSIONS } from '@/components/inputs/ImageInput'
import {
  COMPRESSED_IMAGE_MAX_SIZE,
  SOURCE_IMAGE_MAX_SIZE,
} from '@/constants/image'
import useDebounce from '@/hooks/useDebounce'
import { useSaveImage } from '@/services/api/mutation'
import { getPostQuery } from '@/services/api/query'
import { getTokenomicsMetadataQuery } from '@/services/datahub/content-staking/query'
import { useExtensionModalState } from '@/stores/extension'
import { useMessageData } from '@/stores/message'
import { cx } from '@/utils/class-names'
import { resizeImage } from '@/utils/image'
import React, { useEffect, useRef, useState } from 'react'
import Dropzone from 'react-dropzone'
import { HiTrash } from 'react-icons/hi2'
import { z } from 'zod'
import { ExtensionModalsProps } from '..'
import CommonExtensionModal from '../common/CommonExtensionModal'
import { getPostExtension } from '../utils'

const urlSchema = z.string().url('Please enter a valid URL.')

type ImageStatus = {
  loadedLink: string | null
  isShowingImage: boolean
}
export default function ImageModal({
  hubId,
  chatId,
  onSubmit,
}: ExtensionModalsProps) {
  const { data: tokenomics, isLoading: loadingTokenomics } =
    getTokenomicsMetadataQuery.useQuery(null)
  const { closeModal, initialData, isOpen } =
    useExtensionModalState('subsocial-image')
  const messageToEdit = useMessageData.use.messageToEdit()
  const { data: messageEdit } = getPostQuery.useQuery(messageToEdit ?? '')
  const imageExt = getPostExtension(
    messageEdit?.content?.extensions ?? [],
    'subsocial-image'
  )

  const isEditing = !!imageExt?.properties.image
  const usedInitialData = imageExt?.properties.image || initialData || null

  const [imageLinkStatus, setImageLinkStatus] = useState<ImageStatus>({
    isShowingImage: false,
    loadedLink: null,
  })
  const [imageUploadStatus, setImageUploadStatus] = useState<ImageStatus>({
    isShowingImage: false,
    loadedLink: null,
  })

  useEffect(() => {
    setImageLinkStatus({
      isShowingImage: false,
      loadedLink: null,
    })
    setImageUploadStatus({
      isShowingImage: false,
      loadedLink: null,
    })
  }, [isOpen])

  const isImageLoaded =
    imageLinkStatus.loadedLink || imageUploadStatus.loadedLink

  const generateAdditionalTxParams = async () => {
    let imageUrl: string | null = ''
    if (imageUploadStatus.loadedLink) {
      imageUrl = imageUploadStatus.loadedLink
    } else {
      imageUrl = imageLinkStatus.loadedLink
    }

    if (!imageUrl) return {}

    return {
      extensions: [
        {
          id: 'subsocial-image' as const,
          properties: {
            image: imageUrl,
          },
        },
      ],
    }
  }

  return (
    <CommonExtensionModal
      hubId={hubId}
      onSubmit={() => {
        onSubmit()
        setImageLinkStatus({
          isShowingImage: false,
          loadedLink: null,
        })
        setImageUploadStatus({
          isShowingImage: false,
          loadedLink: null,
        })
      }}
      extensionType='subsocial-image'
      description={
        <span>
          Posting a meme costs{' '}
          <SkeletonFallback
            isLoading={loadingTokenomics}
            className='inline-block w-8'
          >
            <span>{tokenomics?.socialActionPrice.createCommentPoints}</span>
          </SkeletonFallback>{' '}
          points.
        </span>
      }
      isOpen={isOpen}
      closeModal={closeModal}
      size='md'
      mustHaveMessageBody={false}
      chatId={chatId}
      disableSendButton={!isImageLoaded}
      title='Post meme'
      buildAdditionalTxParams={generateAdditionalTxParams}
    >
      <div className='mt-2 flex flex-col gap-4'>
        {!imageUploadStatus.isShowingImage && (
          <ImageLinkInput
            isEditing={isEditing}
            initialUrl={
              typeof usedInitialData === 'string' ? usedInitialData : null
            }
            setImageLinkStatus={setImageLinkStatus}
          />
        )}

        {!imageLinkStatus.isShowingImage && (
          <ImageUpload
            isEditing={isEditing}
            initialImage={
              typeof usedInitialData !== 'string' ? usedInitialData : null
            }
            setUploadedImageLink={setImageUploadStatus}
          />
        )}
      </div>
    </CommonExtensionModal>
  )
}

type ImageLinkInputProps = {
  setImageLinkStatus: React.Dispatch<React.SetStateAction<ImageStatus>>
  initialUrl: string | null
  isEditing: boolean
}
function ImageLinkInput({
  initialUrl,
  setImageLinkStatus,
  isEditing,
}: ImageLinkInputProps) {
  const [imageLink, setImageLink] = useState('')
  const [isImageLinkError, setIsImageLinkError] = useState(false)

  const debouncedImageLink = useDebounce(imageLink, 300)
  const isValidDebouncedImageLink =
    urlSchema.safeParse(debouncedImageLink).success

  useEffect(() => {
    if (initialUrl === null) return
    setImageLink(initialUrl)
  }, [initialUrl])

  useEffect(() => {
    setIsImageLinkError(false)
    setImageLinkStatus((prev) => {
      if (prev.isShowingImage) {
        return {
          loadedLink: '',
          isShowingImage: false,
        }
      }
      return prev
    })
  }, [imageLink, setImageLinkStatus])

  const onImageLinkError = () => {
    if (imageLink !== debouncedImageLink) return
    setIsImageLinkError(true)
  }

  const shouldShowImage =
    isValidDebouncedImageLink && !!imageLink && !isImageLinkError

  useEffect(() => {
    setImageLinkStatus((prev) => ({
      ...prev,
      isShowingImage: shouldShowImage,
    }))
  }, [setImageLinkStatus, shouldShowImage])

  return (
    <>
      {isImageLinkError && (
        <InfoPanel>😥 Sorry, we cannot parse this URL.</InfoPanel>
      )}
      {shouldShowImage && (
        <ImageLoader
          isEditing={isEditing}
          clearImage={() => setImageLink('')}
          src={debouncedImageLink}
          onError={onImageLinkError}
          onLoad={() =>
            setImageLinkStatus({
              loadedLink: debouncedImageLink,
              isShowingImage: true,
            })
          }
        />
      )}
    </>
  )
}

type ImageUploadProps = {
  initialImage: File | null
  setUploadedImageLink: React.Dispatch<React.SetStateAction<ImageStatus>>
  isEditing: boolean
}
function ImageUpload({
  initialImage,
  setUploadedImageLink,
  isEditing,
}: ImageUploadProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const {
    mutate: saveImage,
    isError,
    isLoading,
  } = useSaveImage({
    onSuccess: (res) => {
      const { cid } = res
      setImageUrl(`ipfs://${cid}`)
    },
  })

  useEffect(() => {
    if (!initialImage) return
    saveImage(initialImage)
  }, [initialImage, saveImage])

  const currentLoadedImage = useRef('')
  useEffect(() => {
    const isShowingImage = (!!imageUrl || isLoading) && !isError
    if (currentLoadedImage.current === imageUrl) {
      setUploadedImageLink((prev) => ({ ...prev, isShowingImage }))
    } else {
      setUploadedImageLink({ isShowingImage: false, loadedLink: null })
    }
  }, [setUploadedImageLink, imageUrl, isLoading, isError])

  if (imageUrl) {
    return (
      <ImageLoader
        clearImage={() => setImageUrl('')}
        isEditing={isEditing}
        src={imageUrl}
        onLoad={() => {
          setTimeout(() => {
            currentLoadedImage.current = imageUrl
            setUploadedImageLink((prev) => ({ ...prev, loadedLink: imageUrl }))
          })
        }}
      />
    )
  }

  const onImageChosen = async (files: File[]) => {
    const image = files[0] ?? null
    if (image.size > SOURCE_IMAGE_MAX_SIZE) {
      setErrorMsg(
        `Your image is too big. Try to upload smaller version less than ${
          SOURCE_IMAGE_MAX_SIZE / 1024 / 1024
        } MB`
      )
      return
    }
    const resizedImage = await resizeImage(image)
    if (resizedImage.size > COMPRESSED_IMAGE_MAX_SIZE) {
      setErrorMsg('Your image is too big. Try to upload smaller version')
      return
    }
    saveImage(resizedImage)
  }

  return (
    <>
      <Dropzone
        multiple={false}
        accept={{ 'image/*': SUPPORTED_IMAGE_EXTENSIONS }}
        onDrop={onImageChosen}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className={cx(
              'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-background-primary p-8 text-center',
              isError && 'border-text-red'
            )}
          >
            <input {...getInputProps()} />
            <div className='mb-3 text-3xl'>
              {isLoading ? <Spinner className='h-8 w-8' /> : <ImageAdd />}
            </div>
            <p className='text-xl'>Add a meme</p>
            <p className='text-text-muted'>Or drag it here</p>
          </div>
        )}
      </Dropzone>
      {(errorMsg || isError) && (
        <InfoPanel>
          {errorMsg || '😥 Sorry, we cannot upload your image.'}
        </InfoPanel>
      )}
    </>
  )
}

function ImageLoader({
  clearImage,
  isEditing,
  ...props
}: MediaLoaderProps & { clearImage: () => void; isEditing: boolean }) {
  return (
    <div className='relative overflow-hidden rounded-2xl'>
      <Button
        className='absolute right-4 top-4 z-20 bg-background-light text-xl text-text-red'
        size='circle'
        disabled={isEditing}
        onClick={clearImage}
      >
        <HiTrash />
      </Button>
      <MediaLoader {...props} imageOnly />
    </div>
  )
}
