import { ApiResponse, handlerWrapper } from '@/server/common'
import { syncExternalTokenBalances } from '@/server/datahub-queue/external-token'
import { z } from 'zod'

export type ApiDatahubModerationResponse = ApiResponse
export default handlerWrapper({
  inputSchema: z.object({ payload: z.any() }),
  dataGetter: (req) => req.body,
})({
  allowedMethods: ['POST'],
  errorLabel: 'external-token',
  handler: async (data, _req, res) => {
    await syncExternalTokenBalances(data.payload)

    res.json({
      message: 'OK',
      success: true,
    })
  },
})
