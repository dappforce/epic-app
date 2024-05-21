import Button from '@/components/Button'
import { useEffect } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { useDonateModalContext } from '../../DonateModalContext'
import { chainIdByChainName } from '../../api/config'
import { CommonFields, CommonFieldsProps } from './CommonFields'

type EvmDonateFormProps = Omit<CommonFieldsProps, 'balance' | 'decimals'> & {
  isOpen: boolean
  onSwitchButtonClick: () => void
}

const EvmDonateFormPart = ({
  selectedChain,
  selectedToken,
  isOpen,
  onSwitchButtonClick,
  ...otherProps
}: EvmDonateFormProps) => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { setShowChatForm } = useDonateModalContext()

  const currentChainId = chain?.id
  const destChainId = chainIdByChainName[selectedChain.id]

  const showSwitchButton = !isConnected || currentChainId !== destChainId

  useEffect(() => {
    setShowChatForm?.(!showSwitchButton)
  }, [showSwitchButton, setShowChatForm])

  return showSwitchButton ? (
    <Button size={'lg'} onClick={onSwitchButtonClick}>
      {!isConnected ? 'Connect' : 'Switch'} to {selectedChain.label}
    </Button>
  ) : (
    <CommonFields
      selectedToken={selectedToken}
      selectedChain={selectedChain}
      {...otherProps}
    />
  )
}

export default EvmDonateFormPart
