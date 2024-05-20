import Button from '@/components/Button'
import Input from '@/components/inputs/Input'
import useGetTheme from '@/hooks/useGetTheme'
import { cx } from '@/utils/class-names'
import { BigNumber } from 'bignumber.js'
import { formatUnits, parseUnits } from 'ethers'
import { ChangeEventHandler, useEffect } from 'react'
import { useDonateModalContext } from '../../DonateModalContext'
import { useGetBalance } from '../../api/hooks'

type CommonProps = {
  setAmount: (amount: string) => void
  inputError?: string
  setInputError: (error?: string) => void
  amount: string
  tokenSymbol: string
}

type AmountInputProps = CommonProps & {
  chainKind: 'substrate' | 'evm'
  chainName: string
  tokenId: string
}

const AmountInput = ({ chainKind, ...props }: AmountInputProps) => {
  return <EvmAmountInput {...props} />
}

type AmountInputByKindProps = CommonProps & {
  chainName: string
  tokenId: string
}

const EvmAmountInput = ({
  chainName,
  tokenId,
  ...props
}: AmountInputByKindProps) => {
  const { balance, decimals } = useGetBalance(tokenId, chainName, true)

  return (
    <AmountInputTemplate
      {...props}
      balance={balance}
      tokenSymbol={tokenId.toUpperCase()}
      decimals={decimals}
    />
  )
}

type AmountInputTemplateProps = CommonProps & {
  balance?: string
  decimals?: number
  onMaxClick?: (balanceValue: string) => Promise<void>
}

const AmountInputTemplate = ({
  amount,
  setAmount,
  setInputError,
  inputError,
  tokenSymbol,
  balance,
  decimals,
  onMaxClick,
}: AmountInputTemplateProps) => {
  const theme = useGetTheme()
  const { setDisableButton } = useDonateModalContext()
  const balanceValue =
    decimals && balance ? formatUnits(balance, decimals) : '0'

  const validateField = (value: string) => {
    if (value && decimals && balanceValue && balance) {
      const amountValue = parseUnits(value, decimals)
      if (new BigNumber(amountValue.toString()).gt(new BigNumber(balance))) {
        setInputError('Amount exceeds available balance')
      } else {
        setInputError(undefined)
      }
    }
  }

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const amountInputValue = e.target.value

    setAmount(amountInputValue)

    validateField(amountInputValue)
  }

  const onMaxButtonClick = () => {
    if (balance) {
      onMaxClick?.(balanceValue)

      validateField(balanceValue)
    }
  }

  useEffect(() => {
    const disable =
      !amount ||
      !balance ||
      new BigNumber(amount || '0').lte(0) ||
      new BigNumber(balance || '0').eq(0)

    setDisableButton?.(disable)
  }, [balance, amount, setDisableButton])

  return (
    <div>
      <div className='mb-2 flex justify-between text-sm font-normal leading-4 text-text-muted'>
        <div>Amount</div>
        <div>
          Balance:{' '}
          <span
            className={cx(
              'font-bold',
              theme === 'light' ? 'text-black' : 'text-white'
            )}
          >
            {new BigNumber(balanceValue).toFixed(4)} {tokenSymbol}
          </span>
        </div>
      </div>
      <Input
        step={0.1}
        min={0}
        value={amount}
        autoFocus
        onChange={onInputChange}
        error={inputError}
        rightElement={() => (
          <div>
            <Button
              variant='transparent'
              className={cx(
                'absolute bottom-0 right-4 top-0 my-auto p-1 text-indigo-400',
                'hover:text-indigo-500 hover:ring-0'
              )}
              onClick={onMaxButtonClick}
            >
              Max
            </Button>
          </div>
        )}
        variant='fill-bg'
        type='number'
        className={cx('h-[54px] appearance-none pr-16 text-base')}
      />
    </div>
  )
}

export default AmountInput
