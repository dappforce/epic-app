import SelectInput from '@/components/inputs/SelectInput'
import AmountInput from '../AmountInput'
import { ChainListItem, TokenListItem } from '../types'
import { tokensItems } from '../utils'
import TokenItemPreview from './TokenItemPreview'

export type CommonFieldsProps = {
  selectedToken: TokenListItem
  selectedChain: ChainListItem
  setSelectedToken: (item: TokenListItem) => void
  amount: string
  setAmount: (amount: string) => void
  inputError?: string
  setInputError: (error?: string) => void
  chainKind: 'substrate' | 'evm'
}

export const CommonFields = ({
  selectedToken,
  selectedChain,
  setSelectedToken,
  amount,
  setAmount,
  inputError,
  setInputError,
  chainKind,
}: CommonFieldsProps) => {
  return (
    <>
      <SelectInput
        selected={selectedToken}
        setSelected={setSelectedToken}
        fieldLabel='Token'
        items={tokensItems[selectedChain.id]}
        imgClassName='w-[38px]'
        renderItem={(item, open) => (
          <TokenItemPreview
            item={item}
            chainKind={chainKind}
            chainName={selectedChain.id}
            open={open}
          />
        )}
      />
      <AmountInput
        amount={amount}
        setAmount={setAmount}
        inputError={inputError}
        setInputError={setInputError}
        tokenSymbol={selectedToken.label}
        chainKind={chainKind}
        chainName={selectedChain.id}
        tokenId={selectedToken.id}
      />
    </>
  )
}
