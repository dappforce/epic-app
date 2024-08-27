import {
  ContentContainer,
  getContentContainersQuery,
} from '@/services/datahub/content-containers/query'
import { ReactNode, createContext, useContext } from 'react'

type ChannelContentPageContextType = {
  rootPostId: string
  contentContainer: ContentContainer | null | undefined
  isLoading: boolean
}

const ChannelContentPageContext = createContext<ChannelContentPageContextType>({
  rootPostId: '',
  contentContainer: null,
  isLoading: false,
})

export function ChannelContentPageProvider({
  children,
  rootPostId,
}: {
  children: ReactNode
  rootPostId: string
}) {
  const { data, isLoading } = getContentContainersQuery.useQuery({
    filter: { rootPostIds: [rootPostId], hidden: false },
  })
  const container = data?.data?.[0]

  return (
    <ChannelContentPageContext.Provider
      value={{ rootPostId, contentContainer: container, isLoading }}
    >
      {children}
    </ChannelContentPageContext.Provider>
  )
}

export function useChannelContentPageContext() {
  return useContext(ChannelContentPageContext)
}
