import { ContentContainer } from '@/services/datahub/content-containers/query'
import { getExternalTokenBalancesQuery } from '@/services/datahub/externalTokenBalances/query'
import { getBalanceQuery } from '@/services/datahub/leaderboard/points-balance/query'
import { useMyMainAddress } from '@/stores/my-account'
import { convertToBigInt } from '@/utils/strings'

export default function useTokenGatedRequirement(
  contentContainer?: ContentContainer
) {
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
  let requiredToken = ''
  if (pointsRequirement > 0) {
    isLoading = loadingPoints
    passRequirement = (points ?? 0) >= pointsRequirement
    amountRequired = pointsRequirement
    requiredToken = 'points'
  } else if (externalTokenRequirement > 0) {
    isLoading = loadingExternalTokens
    const tokenBalance = externalTokens?.find(
      (token) => token.id === contentContainer?.externalToken?.id
    )
    passRequirement =
      convertToBigInt(tokenBalance?.amount ?? 0) >= externalTokenRequirement
    amountRequired = Number(
      externalTokenRequirement /
        BigInt(10 ** Number(contentContainer?.externalToken?.decimals ?? 0))
    )
    requiredToken = contentContainer?.externalToken?.name ?? ''
  }

  return { passRequirement, isLoading, amountRequired, requiredToken }
}
