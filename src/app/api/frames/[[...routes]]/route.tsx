/** @jsxImportSource frog/jsx */

import { FrogFramesManager } from '@/server/frames/utils/frog'
import { handle } from 'frog/next'
import { FetchEventLike } from 'hono/types'

const frogApp = FrogFramesManager.getInstance().getFrogApp()

export const GET = async (req: Request, requestContext: FetchEventLike) => {
  const app = await frogApp
  return handle(app)(req, requestContext)
}
export const POST = async (req: Request, requestContext: FetchEventLike) => {
  const app = await frogApp
  return handle(app)(req, requestContext)
}
