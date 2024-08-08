/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { FrogFramesManager } from '@/server/frames/utils/frog'
import { Button, Frog } from 'frog'
import urlJoin from 'url-join'

const frameName = '1723117763252'
const frameRootPath = `/${frameName}`

const getButtonHref = (path: string) => urlJoin(frameRootPath, path)

function getImageUrl(imageId: number): string {
  return process.env.NODE_ENV === 'development'
    ? `http://localhost:3000/frames/${frameName}/${imageId}.png`
    : `https://epicapp.net/frames/${frameName}/${imageId}.png`
}

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
            image: getImageUrl(1),
            // image: `/memeImage/${frameName}/${1}`,
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                Next ➡️
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
            image: getImageUrl(2),
            intents: [
              <Button value='1' action={getButtonHref('/')}>
                ⬅️ Previous
              </Button>,
              <Button value='3' action={getButtonHref('/3')}>
                Next ➡️
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
            image: getImageUrl(3),
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                ⬅️ Previous
              </Button>,
            ],
          })
        })
      },
    },
  ],
}
export default frame
