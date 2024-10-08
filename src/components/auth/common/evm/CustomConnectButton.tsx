import LinkingDark from '@/assets/graphics/linking-dark.svg'
import LinkingLight from '@/assets/graphics/linking-light.svg'
import Button, { ButtonProps } from '@/components/Button'
import { isTouchDevice } from '@/utils/device'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getAddress } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { getConnector, openMobileWallet } from './utils'

type CustomConnectButtonProps = ButtonProps & {
  className?: string
  label?: React.ReactNode
  secondLabel?: React.ReactNode
  additionalSecondActionLabel?: React.ReactNode
  withWalletActionImage?: boolean
  onSuccessConnect: (evmAddress: string) => Promise<void>
  isLoading: boolean
  hideButton?: boolean
}

export const CustomConnectButton = ({
  className,
  onSuccessConnect,
  label = 'Connect Ethereum Address',
  withWalletActionImage = true,
  secondLabel,
  additionalSecondActionLabel,
  hideButton,
  isLoading,
  ...buttonProps
}: CustomConnectButtonProps) => {
  const [hasInteractedOnce, setHasInteractedOnce] = useState(false)

  const onSuccess = async (address: string) => {
    onSuccessConnect(getAddress(address))
  }

  const { disconnect } = useDisconnect()
  const { isConnecting } = useAccount({
    onConnect: ({ address, connector, isReconnected }) => {
      if (address && connector && !isReconnected && !isTouchDevice())
        onSuccessConnect(address)
    },
  })

  useEffect(() => {
    disconnect()
    return () => disconnect()
  }, [disconnect])

  const commonButtonProps: ButtonProps = {
    size: 'lg',
    className: className,
    isLoading: isLoading || isConnecting,
    ...buttonProps,
  }

  const usedLabel = (hasInteractedOnce && secondLabel) || label

  const customButton = (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        if (!connected) {
          return (
            <Button
              {...commonButtonProps}
              onClick={(e) => {
                setHasInteractedOnce(true)
                openConnectModal()
                commonButtonProps.onClick?.(e as any)
              }}
            >
              {label}
            </Button>
          )
        }

        if (chain.unsupported) {
          return (
            <Button
              {...commonButtonProps}
              onClick={(e) => {
                setHasInteractedOnce(true)
                openChainModal()
                commonButtonProps.onClick?.(e as any)
              }}
            >
              Wrong network
            </Button>
          )
        }

        return (
          <>
            {!hideButton && (
              <Button
                {...commonButtonProps}
                onClick={async () => {
                  setHasInteractedOnce(true)
                  const connector = getConnector()
                  isTouchDevice() && (await openMobileWallet({ connector }))
                  onSuccess(account.address)
                }}
              >
                {usedLabel}
              </Button>
            )}
            {additionalSecondActionLabel}
          </>
        )
      }}
    </ConnectButton.Custom>
  )

  if (withWalletActionImage) {
    return (
      <div className='flex w-full flex-col items-center gap-4'>
        <div className='mb-2 w-full'>
          <LinkingLight className='block w-full dark:hidden' />
          <LinkingDark className='hidden w-full dark:block' />
        </div>

        <div className='flex w-full flex-col items-center gap-2'>
          {customButton}
        </div>
      </div>
    )
  }

  return customButton
}
