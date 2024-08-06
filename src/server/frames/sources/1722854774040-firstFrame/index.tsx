/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { Button, Frog } from 'frog'
import urlJoin from 'url-join'

const frameName = '1722854774040-1'
const frameRootPath = `/${frameName}`

const getButtonHref = (path: string) => urlJoin(frameRootPath, path)

const frame = {
  name: frameName,
  src: [
    {
      path: frameRootPath,
      handler: (app: Frog) => {
        app.frame(frameRootPath, (c) => {
          const { buttonValue, inputText, status } = c
          return c.res({
            image:
              'https://ipfs.subsocial.network/ipfs/bafybeia4tkidvvw5gmfyhnvc7a7m75eypsgmmidc7dvtgofdrjlevl7bj4',
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                ➡️
              </Button>,
              // <Button value="share">Share</Button>,
              // status === 'response' && <Button.Reset>Reset</Button.Reset>,
            ],
          })
        })
      },
    },
    {
      path: `${frameRootPath}/2`,
      handler: (app: Frog) => {
        app.frame(`${frameRootPath}/2`, (c) => {
          const { buttonValue, inputText, status } = c
          return c.res({
            image:
              'https://ipfs.subsocial.network/ipfs/bafybeihamqsl2cbkmyse4pbihblclvf7dxlbkgqedcn6zysw7orsutbxuu',
            intents: [
              <Button value='1' action={getButtonHref('/')}>
                ⬅️
              </Button>,
              <Button value='3' action={getButtonHref('/3')}>
                ➡️
              </Button>,
              // <Button.Link href={`https://warpcast.com/~/compose?text=Hello%20world!&embeds[]=https://farcaster.xyz`} >Share</Button.Link>,
              // status === 'response' && <Button.Reset>Reset</Button.Reset>,
            ],
          })
        })
      },
    },
    {
      path: `${frameRootPath}/3`,
      handler: (app: Frog) => {
        app.frame(`${frameRootPath}/3`, (c) => {
          const { buttonValue, inputText, status } = c
          return c.res({
            image:
              'https://ipfs.subsocial.network/ipfs/bafybeia6456picjr2rolhihodu47d34lg4pv6bmtfoohmc27wgezlms6ji',
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                ⬅️
              </Button>,
              // <Button value="share">Share</Button>,
              // status === 'response' && <Button.Reset>Reset</Button.Reset>,
            ],
          })
        })
      },
    },
  ],
}
export default frame
