import useLinkedAddress from '@/hooks/useLinkedProviders'
import { ContentContainer } from '@/services/datahub/content-containers/query'
import {
  ExternalTokenBalance,
  getExternalTokenBalancesQuery,
} from '@/services/datahub/externalTokenBalances/query'
import { ExternalTokenChain } from '@/services/datahub/generated-query'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { useMyMainAddress } from '@/stores/my-account'
import { convertToBigInt } from '@/utils/strings'
import { IdentityProvider } from '@subsocial/data-hub-sdk'

type HasToLinkWallet = 'Solana' | 'Ethereum' | undefined

export default function useTokenGatedRequirement(
  contentContainer?: ContentContainer
) {
  const tokenChain = contentContainer?.externalToken?.chain
  const { identityAddress, isLoading: loadingAddress } = useLinkedAddress(
    undefined,
    { enabled: true },
    tokenChain === ExternalTokenChain.Ethereum
      ? IdentityProvider.EVM
      : IdentityProvider.SOLANA
  )

  const externalTokenRequirement = convertToBigInt(
    contentContainer?.accessThresholdExternalTokenAmount ?? 0
  )
  const pointsRequirement = Number(
    contentContainer?.accessThresholdPointsAmount ?? 0
  )

  const myAddress = useMyMainAddress()
  const needToFetchExternalTokens = externalTokenRequirement > 0 && !!myAddress
  const { data: externalTokens, isLoading: loadingExternalTokens } =
    getExternalTokenBalancesQuery.useQuery(myAddress ?? '', {
      enabled: needToFetchExternalTokens && !!contentContainer,
    })
  const { data: points, isLoading: loadingPoints } = getBalanceQuery.useQuery(
    myAddress ?? '',
    {
      enabled: pointsRequirement > 0 && !!contentContainer,
    }
  )

  let isLoading = false
  let passRequirement = true
  let amountRequired = 0
  let currentToken: ExternalTokenBalance | undefined
  let requiredToken = ''
  let hasToLinkWallet: HasToLinkWallet
  let remainingNeeded = 0
  if (externalTokenRequirement > 0) {
    if (!identityAddress) {
      if (tokenChain === ExternalTokenChain.Ethereum) {
        hasToLinkWallet = 'Ethereum'
      } else if (tokenChain === ExternalTokenChain.Solana) {
        hasToLinkWallet = 'Solana'
      }
    }

    isLoading = loadingExternalTokens
    const tokenBalance = externalTokens?.find(
      (token) => token.externalToken.id === contentContainer?.externalToken?.id
    )
    passRequirement =
      convertToBigInt(tokenBalance?.amount ?? 0) >= externalTokenRequirement
    amountRequired = Number(
      externalTokenRequirement /
        BigInt(10 ** Number(contentContainer?.externalToken?.decimals ?? 0))
    )
    requiredToken = contentContainer?.externalToken?.name ?? ''
    currentToken = tokenBalance
    remainingNeeded = Number(
      (externalTokenRequirement - convertToBigInt(tokenBalance?.amount ?? 0)) /
        BigInt(10 ** Number(contentContainer?.externalToken?.decimals ?? 0))
    )
  } else if (pointsRequirement > 0) {
    isLoading = loadingPoints
    passRequirement = (points ?? 0) >= pointsRequirement
    amountRequired = pointsRequirement
    requiredToken = 'points'
    remainingNeeded = pointsRequirement - (points ?? 0)
  }

  isLoading = isLoading || loadingAddress

  return {
    passRequirement,
    isLoading,
    amountRequired,
    requiredToken,
    chain: tokenChain,
    hasToLinkWallet,
    currentToken,
    remainingNeeded,
  }
}
