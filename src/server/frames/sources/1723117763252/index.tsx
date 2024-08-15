/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { createFramesLike } from '@/server/datahub-queue/frames'
import { FrogFramesManager } from '@/server/frames/utils/frog'
import {
  createSignedSocialDataEvent,
  createSocialDataEventPayload,
  DatahubParams,
} from '@/services/datahub/utils'
import { generateAccount, loginWithSecretKey, Signer } from '@/utils/account'
import {
  IdentityProvider,
  SocialCallDataArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import { Button, Frog } from 'frog'
import urlJoin from 'url-join'
import { linkIdentityWithResult } from '../../utils/identity'

const frameName = '1723117763252'
const frameRootPath = `/${frameName}`

const getButtonHref = (path: string) => urlJoin(frameRootPath, path)

function getImageUrl(imageId: number): string {
  return process.env.NODE_ENV === 'development'
    ? `https://f533390d5520.ngrok.app/frames/${frameName}/${imageId}.png`
    : `https://epicapp.net/frames/${frameName}/${imageId}.png`
}

const sessions: Map<number, { parentProxyAddress: string; signer: Signer }> =
  new Map()
async function getSession(
  fid: number
): Promise<{ parentProxyAddress: string; signer: Signer }> {
  if (sessions.has(fid)) {
    return sessions.get(fid)!
  }

  const { secretKey } = await generateAccount()
  const signer = await loginWithSecretKey(secretKey)

  const params: DatahubParams<
    SocialCallDataArgs<'synth_init_linked_identity'>
  > = {
    address: signer.address,
    signer: signer,
    isOffchain: true,
    // need to provide timestamp to not try to get time from api, which can't be done because its on backend
    timestamp: Date.now(),
    args: {
      externalProvider: {
        id: fid.toString(),
        provider: IdentityProvider.FARCASTER,
      },
    },
  }
  const input = await createSocialDataEventPayload(
    socialCallName.synth_init_linked_identity,
    params,
    params.args
  )
  const address = await linkIdentityWithResult(signer.address, input)

  sessions.set(fid, { parentProxyAddress: address, signer })

  return { signer, parentProxyAddress: address }
}

async function getSignerAndCreateFramesLike(
  fid: number,
  previousClickedValue: number
) {
  try {
    const { signer, parentProxyAddress } = await getSession(fid)
    const params: DatahubParams<
      SocialCallDataArgs<'synth_active_staking_create_farcaster_frame_like'>
    > = {
      address: signer.address,
      proxyToAddress: parentProxyAddress,
      signer: signer,
      isOffchain: true,
      timestamp: Date.now(),
      args: {
        frameId: parseInt(frameName),
        frameStepIndex: previousClickedValue,
        actorFid: fid,
      },
    }
    const input = await createSignedSocialDataEvent(
      'synth_active_staking_create_farcaster_frame_like',
      params,
      params.args
    )
    await createFramesLike(input)
  } catch (err) {
    console.error('Failed to create frames like', err)
  }
}

const frame = {
  name: frameName,
  src: [
    {
      path: frameRootPath,
      handler: (app: Frog) => {
        app.frame(frameRootPath, async (c) => {
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: 1,
          })

          const fid = c.frameData?.fid
          const previousClickedValue = c.buttonValue
          if (fid && previousClickedValue) {
            await getSignerAndCreateFramesLike(
              fid,
              parseInt(previousClickedValue)
            )
          }

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
        app.frame(`${frameRootPath}/2`, async (c) => {
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: 2,
          })

          const fid = c.frameData?.fid
          const previousClickedValue = c.buttonValue
          if (fid && previousClickedValue) {
            await getSignerAndCreateFramesLike(
              fid,
              parseInt(previousClickedValue)
            )
          }

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
        app.frame(`${frameRootPath}/3`, async (c) => {
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: 3,
          })

          const fid = c.frameData?.fid
          const previousClickedValue = c.buttonValue
          console.log(fid, previousClickedValue)
          if (fid && previousClickedValue) {
            await getSignerAndCreateFramesLike(
              fid,
              parseInt(previousClickedValue)
            )
          }

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
