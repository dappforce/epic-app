/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
/** @jsxImportSource frog/jsx */
import { createFramesLike } from '@/server/datahub-queue/frames'
import { FRAME_IMAGE_SIZE, FrogFramesManager } from '@/server/frames/utils/frog'
import {
  DatahubParams,
  createSignedSocialDataEvent,
  createSocialDataEventPayload,
} from '@/services/datahub/utils'
import { Signer, generateAccount, loginWithSecretKey } from '@/utils/account'
import { formatNumber } from '@/utils/strings'
import {
  IdentityProvider,
  SocialCallDataArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import { Button, Frog } from 'frog'
import urlJoin from 'url-join'
import { getAddressBalance, linkIdentityWithResult } from '../../utils/identity'

const frameName = '1723117763252'
const frameRootPath = `/${frameName}`

const getButtonHref = (path: string) => urlJoin(frameRootPath, path)

function getImageUrl(imageId: number): string {
  return process.env.NODE_ENV === 'development'
    ? `http://localhost:3000/frames/${frameName}/${imageId}.jpg`
    : `https://epicapp.net/frames/${frameName}/${imageId}.jpg`
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
                  action={getButtonHref(i > 1 ? `/${i}` : '/')}
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

            // first frame needs to be small, so it just shows the image
            if (i === 0) {
              return c.res({
                image: getImageUrl(i + 1),
                intents,
              })
            }
            return c.res({
              image: (
                <div style={{ display: 'flex', position: 'relative' }}>
                  <img
                    src={getImageUrl(i + 1)}
                    alt=''
                    width={FRAME_IMAGE_SIZE}
                    height={FRAME_IMAGE_SIZE}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      objectFit: 'cover',
                      filter: 'blur(30px)',
                    }}
                  />
                  <img
                    src={getImageUrl(i + 1)}
                    alt=''
                    width={FRAME_IMAGE_SIZE}
                    height={FRAME_IMAGE_SIZE}
                    style={{
                      objectFit: 'contain',
                      position: 'relative',
                    }}
                  />
                </div>
              ),
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
            getSignerAndCreateFramesLike(fid, parseInt(previousClickedValue))
          }

          let balance = 0
          if (fid) {
            const session = await getSession(fid)
            balance = await getAddressBalance(session.parentProxyAddress)
          }

          return c.res({
            image: (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: FRAME_IMAGE_SIZE,
                  width: FRAME_IMAGE_SIZE,
                  padding: '20px',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '20px' }}>You have earned</span>
                <span style={{ fontSize: '32px', fontWeight: 700 }}>
                  {formatNumber(balance)} points 💎
                </span>
              </div>
            ),
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
