import { ApiResponse, handlerWrapper } from '@/server/common'
import { getBlockedInPostIds } from '@/server/moderation'
import { z } from 'zod'

const paramsSchema = z.object({
  spaceIds: z.array(z.string()).or(z.string()),
})
export type ApiModerationBlockedInPostIdsParams = z.infer<typeof paramsSchema>

type ResponseData = {
  data: Awaited<ReturnType<typeof getBlockedInPostIds>>
}
export type ApiModerationBlockedInPostIdsResponse = ApiResponse<ResponseData>

export default handlerWrapper({
  inputSchema: paramsSchema,
  dataGetter: (req) => req.query,
})<ResponseData>({
  allowedMethods: ['GET'],
  errorLabel: 'blocked-post-ids',
  handler: async (data, _, res) => {
    const response = await getBlockedInPostIds(
      Array.isArray(data.spaceIds) ? data.spaceIds : [data.spaceIds]
    )
    res.json({ data: response, success: true, message: 'OK' })
  },
})
