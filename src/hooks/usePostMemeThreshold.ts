import { getContentContainersQuery } from '@/services/datahub/content-containers/query'

export default function usePostMemeThreshold(chatId: string) {
  const { data, isLoading } = getContentContainersQuery.useQuery(
    {
      filter: { hidden: false, rootPostIds: [chatId] },
    },
    { enabled: !!chatId }
  )
  const container = data?.data[0]

  const threshold = container?.accessThresholdPointsAmount

  return {
    threshold,
    isLoading,
  }
}
