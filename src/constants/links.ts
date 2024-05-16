import { env } from '@/env.mjs'

export const SUGGEST_FEATURE_LINK = 'https://grillapp.net/c/subsocial/85666'

export function getSuggestNewChatRoomLink(prefill: {
  chatName?: string
  hubId?: string
}) {
  return `https://docs.google.com/forms/d/e/1FAIpQLSdhp3ZGAH3Gxbm6xtRcd8QgjI3M2RVdUY9UqepseXKr3DXirw/viewform?entry.96999585=${
    prefill.hubId ?? ''
  }&entry.1674564644=${prefill.chatName}`
}

export function getTelegramNotificationsBotLink(command: string) {
  return `${env.NEXT_PUBLIC_TELEGRAM_NOTIFICATION_BOT}?start=${command}`
}

export const SUBSOCIAL_IPFS_GATEWAY = 'https://ipfs.subsocial.network/'

export const CONTENT_STAKING_LINK = 'https://sub.id/creators'
