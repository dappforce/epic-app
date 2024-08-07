import {
  coingeckoTokenIds,
  getPriceQuery,
} from '@/services/subsocial/prices/query'
import { getBalanceInDollars } from '@/utils/balance'
import { cx } from '@/utils/class-names'
import BigNumber from 'bignumber.js'
import { formatUnits } from 'ethers'
import Image from 'next/image'
import { isValidElement } from 'react'
import { useGetBalance } from '../../api/hooks'
import { TokenListItem } from '../types'

type CommonProps = {
  item: TokenListItem
  chainName: string
  open: boolean
}

type TokenItemPreviewTemplateProps = {
  item: TokenListItem
  balanceValue: string
  amountInDollars: string
}

type TokenItemsPreviewProps = CommonProps & {
  chainKind: 'substrate' | 'evm'
}

const TokenItemPreview = ({ chainKind, ...props }: TokenItemsPreviewProps) => {
  const tokenId = coingeckoTokenIds[(props.item.id as string).toLowerCase()]

  const { data } = getPriceQuery.useQuery(tokenId)

  const price = data?.current_price

  return <EvmTokenItemPreview {...props} price={price} />
}

type TokenItemPreviewByKindProps = CommonProps & {
  price?: string | null
}

const EvmTokenItemPreview = ({
  item,
  chainName,
  open,
  price,
}: TokenItemPreviewByKindProps) => {
  const { balance, decimals } = useGetBalance(item.id, chainName, open)

  const balanceValue =
    decimals && balance ? formatUnits(balance, decimals) : '0'

  const amountInDollars = getBalanceInDollars(balanceValue, price)

  return (
    <TokenItemPreviewTemplate
      item={item}
      balanceValue={balanceValue}
      amountInDollars={amountInDollars}
    />
  )
}

const TokenItemPreviewTemplate = ({
  item,
  balanceValue,
  amountInDollars,
}: TokenItemPreviewTemplateProps) => {
  const balanceBN = new BigNumber(balanceValue || '0')

  return (
    <div className='flex w-full items-center justify-between'>
      <div className='flex items-center gap-3'>
        {item.icon &&
          (isValidElement(item.icon) ? (
            item.icon
          ) : (
            <Image
              src={item.icon as string}
              className={cx(
                'h-[38px] w-[38px] rounded-full object-cover object-center'
              )}
              alt=''
              role='presentation'
            />
          ))}
        <span
          className={cx('mr-3 block truncate text-base', {
            ['text-gray-500']: item.disabledItem,
          })}
        >
          {item.label}
        </span>
      </div>
      <div className='flex flex-col text-right'>
        <span className='font-bold'>
          {!balanceBN.isZero() ? balanceBN.toFixed(4) : '-'}
        </span>
        {!balanceBN.isZero() && (
          <span className='text-text-muted'>${amountInDollars}</span>
        )}
      </div>
    </div>
  )
}

export default TokenItemPreview
