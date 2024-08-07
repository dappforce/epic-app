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
            image: `/memeImage/${frameName}-${1}`,
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
            image: `/memeImage/${frameName}-${2}`,
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
            image: `/memeImage/${frameName}-${3}`,
            intents: [
              <Button value='2' action={getButtonHref('/2')}>
                ⬅️ Previous
              </Button>,
            ],
          })
        })
      },
    },
    {
      path: 'memeImage',
      handler: (app: Frog) => {
        app.image('/memeImage/:frameImageId', async (c) => {
          const { frameImageId } = c.req.param()

          return c.res({
            image: (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'black',
                  height: '100%',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
                  padding: '20px',
                  borderRadius: '15px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                }}
              >
                <img
                  src={
                    process.env.NODE_ENV === 'development'
                      ? `http://localhost:3000/frames/${frameImageId}.png`
                      : `https://epicapp.net/frames/${frameImageId}.png`
                  }
                  alt='UNDRGRND logo'
                  style={{
                    position: 'absolute',
                    top: '0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 1,
                  }}
                />
              </div>
            ),
            imageOptions: {
              headers: {
                'Cache-Control': `public, max-age=0`,
                'cache-control': `public, max-age=0`,
              },
            },
          })
        })
      },
    },
  ],
}
export default frame
