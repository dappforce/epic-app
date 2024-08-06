import { env } from '@/env.mjs'
import { sendServerEvent } from '@/server/analytics'
import { Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
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
      // Supply a Hub to enable frame verification.
      // hub: neynar({ apiKey: process.env.DATAHUB_NEYNAR_API_KEY || '' }),
      title: 'Epic Meme2Earn',
      secret: env.FRAMES_SECRET,
      imageAspectRatio: '1:1',
      imageOptions: {
        width: 800,
        height: 800,
        // fonts: [
        //   {
        //     name: "Radio Canada",
        //     weight: 400,
        //     source: "google",
        //   },
        //   {
        //     name: "Radio Canada",
        //     weight: 600,
        //     source: "google",
        //   },
        // ],
      },
    })
    sendServerEvent('frog_app_init', {
      test: 'test',
    })
    console.log('initFrogApp')

    this.initFrames()

    devtools(this.frogAppInstance, { serveStatic })
  }
}
