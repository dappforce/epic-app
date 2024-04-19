import { getAliasFromHubId } from '@/constants/config'
import { env } from '@/env.mjs'
import { isServer } from '@tanstack/react-query'
import { ParsedUrlQuery } from 'querystring'
import urlJoin from 'url-join'

export function getUrlQuery(queryName: string) {
  if (isServer) return ''
  const query = window.location.search
  const searchParams = new URLSearchParams(query)
  return searchParams.get(queryName) ?? ''
}

export function getCurrentUrlOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export function getCurrentUrlWithoutQuery(queryNameToRemove?: string) {
  if (queryNameToRemove) {
    const query = window.location.search
    const searchParams = new URLSearchParams(query)
    searchParams.delete(queryNameToRemove)

    const url = window.location.origin + window.location.pathname
    const search = searchParams.toString()

    if (!search) return url
    return url + '?' + search
  }
  return window.location.origin + window.location.pathname
}

export function getCurrentSearchParams() {
  if (isServer) return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

type CurrentPath = { query: ParsedUrlQuery; pathname?: string }
function getHubIdFromUrl(currentPath: CurrentPath) {
  return currentPath.query.hubId as string
}

export function getHubPageLink(currentPath: CurrentPath) {
  const hubId = getHubIdFromUrl(currentPath)
  const isWidgetRoute = currentPath.pathname?.includes('/widget')
  if (!isWidgetRoute) return `/${hubId ?? ''}`
  return `/widget/${hubId ?? ''}`
}

export function getChatPageLink(
  currentPath: CurrentPath,
  chatSlug?: string,
  defaultHubId?: string
) {
  const hubId = getHubIdFromUrl(currentPath) ?? defaultHubId
  const hubAliasOrId = getAliasFromHubId(hubId) || hubId

  const currentSlug = currentPath.query.slug
  if (!chatSlug && typeof currentSlug === 'string') {
    chatSlug = currentSlug
  }
  const isWidgetRoute = currentPath.pathname?.includes('/widget')
  if (!isWidgetRoute) return `/${hubAliasOrId}/${chatSlug}`
  return `/widget/${hubAliasOrId}/${chatSlug}`
}

export const getWidgetChatPageLink = (
  currentPath: CurrentPath,
  chatSlug: string,
  defaultHubId?: string
) => {
  const hubId = getHubIdFromUrl(currentPath) ?? defaultHubId
  const hubAliasOrId = getAliasFromHubId(hubId) || hubId

  const currentSlug = currentPath.query.slug
  if (!chatSlug && typeof currentSlug === 'string') {
    chatSlug = currentSlug
  }

  return `/c/${hubAliasOrId}/${chatSlug}`
}

export function validateVideoUrl(url: string) {
  const videoFileUrlRegex = /\.(mp4|mov|avi|wmv|flv|mkv)$/i
  return videoFileUrlRegex.test(url)
}

export function getPolkadotJsUrl(pathname?: string) {
  return urlJoin(
    `https://polkadot.js.org/apps/?rpc=${env.NEXT_PUBLIC_SUBSTRATE_WSS}/#/`,
    pathname ?? ''
  )
}

export function getUserProfileLink(profileId?: string) {
  if (!profileId) return undefined
  return `/${profileId}`
}
