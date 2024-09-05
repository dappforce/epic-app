import { LocalStorage } from '@/utils/storage'
import { useCallback } from 'react'

const getStorageKey = (chatId: string) => `last-read-timestamp-${chatId}`
export const lastReadStorage = new LocalStorage(getStorageKey)

export default function useLastReadTimeFromStorage(chatId: string) {
  const setLastReadTime = useCallback(
    (createdAtTime: number) => {
      lastReadStorage.set(createdAtTime.toString(), chatId)
    },
    [chatId]
  )

  const getLastReadTime = useCallback(() => {
    const data = lastReadStorage.get(chatId)
    return parseInt(data ?? '')
  }, [chatId])

  return {
    getLastReadTime,
    setLastReadTime,
  }
}
