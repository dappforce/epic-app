import { getMyMainAddress } from '@/stores/my-account'
import { createQuery } from '@/subsocial-query'
import { LocalStorage } from '@/utils/storage'
import { convertToBigInt } from '@/utils/strings'
import { gql } from 'graphql-request'
import {
  GetExternalTokenBalancesQuery,
  GetExternalTokenBalancesQueryVariables,
} from '../generated-query'
import { datahubQueryRequest } from '../utils'

const GET_EXTERNAL_TOKEN_BALANCES = gql`
  query GetExternalTokenBalances($address: String!) {
    socialProfileBalances(args: { where: { address: $address } }) {
      externalTokenBalances {
        id
        active
        amount
        blockchainAddress
        externalToken {
          id
          address
          decimals
        }
      }
    }
  }
`
export const getExternalTokenBalancesCache = new LocalStorage(
  () => 'my-balance-cache'
)
export type ExternalTokenBalance = NonNullable<
  NonNullable<
    GetExternalTokenBalancesQuery['socialProfileBalances']
  >['externalTokenBalances']
>[number] & { parsedAmount: number }
async function getExternalTokenBalances(
  address: string
): Promise<ExternalTokenBalance[]> {
  const res = await datahubQueryRequest<
    GetExternalTokenBalancesQuery,
    GetExternalTokenBalancesQueryVariables
  >({
    document: GET_EXTERNAL_TOKEN_BALANCES,
    variables: { address },
  })

  const balances = (res.socialProfileBalances?.externalTokenBalances || [])
    .filter((balance) => balance.active)
    .map((balance) => ({
      ...balance,
      parsedAmount: Number(
        convertToBigInt(balance.amount) /
          BigInt(10 ** balance.externalToken.decimals)
      ),
    }))
  if (address === getMyMainAddress()) {
    getExternalTokenBalancesCache.set(JSON.stringify(balances))
  }
  return balances
}
export const getExternalTokenBalancesQuery = createQuery({
  key: 'getExternalTokenBalances',
  fetcher: getExternalTokenBalances,
  defaultConfigGenerator: (address) => {
    let cache: ExternalTokenBalance[] | undefined = undefined
    if (getMyMainAddress() === address) {
      try {
        const data = JSON.parse(getExternalTokenBalancesCache.get() || '')
        if (Array.isArray(data)) {
          cache = data as ExternalTokenBalance[]
        }
      } catch {}
    }
    return {
      enabled: !!address,
      placeholderData: cache || undefined,
    }
  },
})
