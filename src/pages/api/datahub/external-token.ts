import { ApiResponse, handlerWrapper } from '@/server/common'
import { claimTasksTokens } from '@/server/datahub-queue/claim-tasks-tokens'
import { datahubMutationWrapper } from '@/server/datahub-queue/utils'
import { z } from 'zod'

export type ApiDatahubModerationResponse = ApiResponse
export default handlerWrapper({
  inputSchema: z.object({ address: z.string() }),
  dataGetter: (req) => req.body,
})({
  allowedMethods: ['POST'],
  errorLabel: 'external-token',
  handler: async (data, _req, res) => {
    const mapper = datahubMutationWrapper(claimTasksTokens)
    await mapper(payload)

    res.json({
      message: 'OK',
      success: true,
    })
  },
})
