import useIsMounted from '@/hooks/useIsMounted'
import { useConfigContext } from '@/providers/config/ConfigProvider'
import { useMemo } from 'react'

export default function useSortChatIdsByConfig(chatIds: string[]) {
  const { order } = useConfigContext()
  const mounted = useIsMounted()

  return useMemo(() => {
    if (mounted && order) {
      if (order.length === 0) return chatIds
      const filteredOrder = order.filter((item) => chatIds.includes(item))
      return [
        ...filteredOrder,
        ...chatIds.filter((item) => !filteredOrder.includes(item)),
      ]
    }
    return chatIds
  }, [chatIds, mounted, order])
}
