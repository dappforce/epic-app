import { env } from '@/env.mjs'
import { sendServerEvent } from '@/server/analytics'
import { Frog } from 'frog'
import { devtools } from 'frog/dev'
import { neynar } from 'frog/hubs'
import { serveStatic } from 'frog/serve-static'
import { FrameData } from 'frog/types/frame'
import frames from '../sources'
import { FrameDefinition } from './types'

export class FrogFramesManager {
  private static instance: FrogFramesManager
  private frogAppInstance: Frog | null = null
  private frameDefinitions: { [key: string]: FrameDefinition } = {}

  static getInstance(): FrogFramesManager {
    if (!FrogFramesManager.instance) {
      FrogFramesManager.instance = new FrogFramesManager()
    }
    return FrogFramesManager.instance
  }

  constructor() {
    this.importFramesDefinitions()
    this.initFrogApp()
  }

  get frogApp(): Frog {
    if (this.frogAppInstance) return this.frogAppInstance
    this.importFramesDefinitions()
    this.initFrogApp()
    return this.frogAppInstance!
  }

  private importFramesDefinitions() {
    Object.keys(frames).forEach((key) => {
      // @ts-ignore
      this.frameDefinitions[key] = frames[key] as FrameDefinition
    })
  }

  initFrames() {
    for (const frameDefinition in this.frameDefinitions) {
      for (const frame of this.frameDefinitions[frameDefinition].src) {
        frame.handler(this.frogAppInstance!)
      }
    }
  }

  initFrogApp() {
    this.frogAppInstance = new Frog({
      assetsPath: '/',
      basePath: '/api/frames',
      ...(env.NEYNAR_API_KEY
        ? { hub: neynar({ apiKey: env.NEYNAR_API_KEY || '' }) }
        : {}),
      title: 'Epic Meme2Earn',
      secret: env.FRAMES_SECRET,
      imageAspectRatio: '1:1',
      imageOptions: {
        width: 800,
        height: 800,
      },
    })

    this.initFrames()

    devtools(this.frogAppInstance, { serveStatic })
  }

  static sendAnalyticsEventOnFrameAction<
    C extends {
      status: 'initial' | 'redirect' | 'response'
      url: string
      frameData?: FrameData
      buttonValue?: string
    }
  >(frameName: string, contextData: C, customPayload: Record<any, any> = {}) {
    const { buttonValue, status, frameData, url } = contextData

    if (status === 'initial') {
      sendServerEvent('farcaster_frame_initial_open', {
        frameName,
        frameStepId: 1,
        frameUrl: url,
        ...customPayload,
      })
    } else if (status === 'response') {
      sendServerEvent('farcaster_frame_step_open', {
        frameName,
        frameStepId: 1,
        frameUrl: url,
        buttonValue,
        ...(frameData
          ? {
              interactorFid: frameData.fid,
              castHash: frameData.castId.hash,
              castOwnerFid: frameData.castId.fid,
              messageHash: frameData.messageHash,
              timestamp: frameData.timestamp,
            }
          : {}),
        ...customPayload,
      })
    }
  }
}
