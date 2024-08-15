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
    ? `http://localhost:3000/frames/${frameName}/${imageId}.avif`
    : `https://epicapp.net/frames/${frameName}/${imageId}.avif`
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
  if (!address) return { parentProxyAddress: '', signer }

  sessions.set(fid, { parentProxyAddress: address, signer })
  return { signer, parentProxyAddress: address }
}

async function getSignerAndCreateFramesLike(
  fid: number,
  previousClickedValue: number
) {
  try {
    const { signer, parentProxyAddress } = await getSession(fid)
    if (!parentProxyAddress) return

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

const memesAmount = 7

const frame = {
  name: frameName,
  src: [
    ...Array.from({ length: memesAmount }).map((_, i) => {
      const path = `${frameRootPath}${i > 0 ? `/${i + 1}` : ''}`
      return {
        path,
        handler: (app: Frog) => {
          app.frame(path, async (c) => {
            FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
              frameStepId: i + 1,
            })

            const fid = c.frameData?.fid
            const previousClickedValue = c.buttonValue
            if (
              fid &&
              previousClickedValue &&
              parseInt(previousClickedValue) <= memesAmount
            ) {
              getSignerAndCreateFramesLike(fid, parseInt(previousClickedValue))
            }

            const intents: any[] = []
            if (i > 0) {
              intents.push(
                <Button
                  value={i.toString()}
                  action={getButtonHref(i > 0 ? `/${i}` : '/')}
                >
                  ⬅️ Previous
                </Button>
              )
            }
            intents.push(
              <Button
                value={(i + 2).toString()}
                action={getButtonHref(`/${i + 2}`)}
              >
                Next ➡️
              </Button>
            )

            return c.res({
              image: getImageUrl(i + 1),
              intents,
            })
          })
        },
      }
    }),
    {
      path: `${frameRootPath}/${memesAmount + 1}`,
      handler: (app: Frog) => {
        app.frame(`${frameRootPath}/${memesAmount + 1}`, async (c) => {
          FrogFramesManager.sendAnalyticsEventOnFrameAction(frameName, c, {
            frameStepId: memesAmount + 1,
          })

          const fid = c.frameData?.fid
          const previousClickedValue = c.buttonValue
          if (
            fid &&
            previousClickedValue &&
            parseInt(previousClickedValue) <= memesAmount
          ) {
            await getSignerAndCreateFramesLike(
              fid,
              parseInt(previousClickedValue)
            )
          }

          return c.res({
            image: <div>asdfasdfsfd</div>,
            intents: [
              <Button
                value={memesAmount.toString()}
                action={getButtonHref(`/${memesAmount}`)}
              >
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
