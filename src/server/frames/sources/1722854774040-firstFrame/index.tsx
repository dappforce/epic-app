/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { FrogFramesManager } from '@/server/frames/utils/frog'
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
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: 1,
          })

          return c.res({
            image:
              'https://ipfs.subsocial.network/ipfs/bafybeia4tkidvvw5gmfyhnvc7a7m75eypsgmmidc7dvtgofdrjlevl7bj4',
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                ➡️
              </Button>,
            ],
          })
        })
      },
    },
    {
      path: `${frameRootPath}/2`,
      handler: (app: Frog) => {
        app.frame(`${frameRootPath}/2`, (c) => {
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: 2,
          })

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
            ],
          })
        })
      },
    },
    {
      path: `${frameRootPath}/3`,
      handler: (app: Frog) => {
        app.frame(`${frameRootPath}/3`, (c) => {
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: 3,
          })

          return c.res({
            image:
              'https://ipfs.subsocial.network/ipfs/bafybeia6456picjr2rolhihodu47d34lg4pv6bmtfoohmc27wgezlms6ji',
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                ⬅️
              </Button>,
            ],
          })
        })
      },
    },
  ],
}
export default frame
