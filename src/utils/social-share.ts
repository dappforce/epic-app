export const openNewWindow = (url: string) =>
  window.open(
    url,
    '_blank',
    'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=500,height=400'
  )

type OptionsType = {
  tags?: string[]
}

export const twitterShareUrl = (
  url: string,
  text?: string,
  options?: OptionsType
) => {
  const tags = options?.tags
  const textVal = text ? `text=${encodeURIComponent(text)}` : ''

  return `https://twitter.com/intent/tweet?${textVal}&url=${encodeURIComponent(
    '\n' + url + '\n\n'
  )}&hashtags=${[...(tags || [])]}&original_referer=${url}`
}

export const farcasterShareUrl = (url: string, text: string) => {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(
    text
  )}&embeds[]=${url}`
}
