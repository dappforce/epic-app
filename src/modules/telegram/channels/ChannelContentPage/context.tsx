import {
  ContentContainer,
  getContentContainersQuery,
} from '@/services/datahub/content-containers/query'
import { ReactNode, createContext, useContext, useState } from 'react'

type ChannelContentPageContextType = {
  rootPostId: string
  contentContainer: ContentContainer | null | undefined
  isLoading: boolean
  setIsModerating: (isModerating: boolean) => void
  isModerating: boolean
}

const ChannelContentPageContext = createContext<ChannelContentPageContextType>({
  rootPostId: '',
  contentContainer: null,
  isLoading: false,
  setIsModerating: () => {},
  isModerating: false,
})

export function ChannelContentPageProvider({
  children,
  rootPostId,
}: {
  children: ReactNode
  rootPostId: string
}) {
  const [isModerating, setIsModerating] = useState(false)
  const { data, isLoading } = getContentContainersQuery.useQuery({
    filter: { rootPostIds: [rootPostId], hidden: false },
  })
  const container = data?.data?.[0]

  return (
    <ChannelContentPageContext.Provider
      value={{
        rootPostId,
        contentContainer: container,
        isLoading,
        setIsModerating,
        isModerating,
      }}
    >
      {children}
    </ChannelContentPageContext.Provider>
  )
}

export function useChannelContentPageContext() {
  return useContext(ChannelContentPageContext)
}
