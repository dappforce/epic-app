import {
  ContentContainer,
  getContentContainersQuery,
} from '@/services/datahub/content-containers/query'
import { ReactNode, createContext, useContext } from 'react'

type ChannelContentPageContextType = {
  containerId: string
  contentContainer: ContentContainer | null | undefined
  isLoading: boolean
}

const ChannelContentPageContext = createContext<ChannelContentPageContextType>({
  containerId: '',
  contentContainer: null,
  isLoading: false,
})

export function ChannelContentPageProvider({
  children,
  containerId,
}: {
  children: ReactNode
  containerId: string
}) {
  const { data, isLoading } = getContentContainersQuery.useQuery({
    filter: { ids: [containerId], hidden: false },
  })
  const container = data?.data?.[0]

  return (
    <ChannelContentPageContext.Provider
      value={{ containerId, contentContainer: container, isLoading }}
    >
      {children}
    </ChannelContentPageContext.Provider>
  )
}

export function useChannelContentPageContext() {
  return useContext(ChannelContentPageContext)
}
