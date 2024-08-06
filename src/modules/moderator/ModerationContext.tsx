import { createContext, useContext, useState } from 'react'

const PAGE_SIZE = 8

export type ModerationContext = {
  selectedPostIds: string[]
  setSelectedPostIds: (ids: string[]) => void
  page: number
  setPage: (page: number) => void
  pageSize: number
}

const ModerationContext = createContext<ModerationContext>({} as any)

type ContextWrapperProps = {
  children: React.ReactNode
}

export const ModerationContextWrapper: React.FC<ContextWrapperProps> = ({
  children,
}) => {
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const value = {
    selectedPostIds,
    setSelectedPostIds,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  }

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  )
}

export const useModerationContext = () => useContext(ModerationContext)
