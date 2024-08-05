/** @jsxImportSource frog/jsx */

import { FrogFramesManager } from '@/server/frames/utils/frog'
import { handle } from 'frog/next'

const frogApp = FrogFramesManager.getInstance().frogApp

export const GET = handle(frogApp)
export const POST = handle(frogApp)
