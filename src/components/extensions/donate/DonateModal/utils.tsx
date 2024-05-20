import Astar from '@/assets/graphics/chains/astar.png'
import Moonbeam from '@/assets/graphics/chains/moonbeam.png'
import Polygon from '@/assets/graphics/chains/polygon.png'
import ASTR from '@/assets/graphics/tokens/astr.webp'
import DOT from '@/assets/graphics/tokens/dot.webp'
import ETH from '@/assets/graphics/tokens/eth.png'
import GLMR from '@/assets/graphics/tokens/glmr.webp'
import SUB from '@/assets/graphics/tokens/sub.png'
import USDC from '@/assets/graphics/tokens/usdc.png'
import USDT from '@/assets/graphics/tokens/usdt.png'
import BigNumber from 'bignumber.js'
import { StaticImageData } from 'next/image'
import { ChainListItem } from './types'

export const chainItems: ChainListItem[] = [
  {
    id: 'polygon',
    icon: Polygon,
    label: 'Polygon',
    chainKind: 'evm',
  },
  {
    id: 'moonbeam',
    icon: Moonbeam,
    label: 'Moonbeam',
    chainKind: 'evm',
  },
  {
    id: 'astar',
    icon: Astar,
    label: 'Astar',
    disabledItem: 'Soon',
    chainKind: 'substrate',
  },
]

type TokenItem = {
  id: string
  icon: StaticImageData
  label: string
  isNativeToken?: boolean
}

type TokenItemsByChainName = Record<string, TokenItem[]>

export const tokensItems: TokenItemsByChainName = {
  polygon: [
    {
      id: 'usdt',
      icon: USDT,
      label: 'USDT',
    },
    {
      id: 'usdc',
      icon: USDC,
      label: 'USDC',
    },
    {
      id: 'matic',
      icon: Polygon,
      label: 'MATIC',
      isNativeToken: true,
    },
    {
      id: 'eth',
      icon: ETH,
      label: 'ETH',
    },
  ],
  moonbeam: [
    {
      id: 'glmr',
      icon: GLMR,
      label: 'GLMR',
      isNativeToken: true,
    },
    {
      id: 'sub',
      icon: SUB,
      label: 'SUB',
    },
    {
      id: 'dot',
      icon: DOT,
      label: 'DOT',
    },
    {
      id: 'usdt',
      icon: USDT,
      label: 'USDT',
    },
    {
      id: 'usdc',
      icon: USDC,
      label: 'USDC',
    },
    {
      id: 'astr',
      icon: ASTR,
      label: 'ASTR',
    },
  ],
  subsocial: [
    {
      id: 'sub',
      icon: SUB,
      label: 'SUB',
      isNativeToken: true,
    },
  ],
}

export const getAmountPreview = (amount?: string, symbol?: string) =>
  amount ? ` ${new BigNumber(amount).toFormat()} ${symbol}` : ''
