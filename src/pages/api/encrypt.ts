import { env } from '@/env.mjs'
import { ApiResponse, handlerWrapper } from '@/server/common'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { z } from 'zod'

type ResponseData = { encrypted: string; nonce: string }
export type ApiEncryptResponseData = ApiResponse<ResponseData>

export default handlerWrapper({
  dataGetter: (req) => req.body,
  inputSchema: z.object({
    data: z.string(),
  }),
})<ResponseData>({
  errorLabel: 'encrypt',
  allowedMethods: ['POST'],
  handler: async ({ data }, _, res) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const encrypted = Buffer.from(
      nacl.secretbox(
        Buffer.from(data) as unknown as Uint8Array,
        nonce,
        bs58.decode(env.DAPP_SECRET_KEY)
      )
    ).toString('hex')

    res.json({
      encrypted,
      nonce: bs58.encode(nonce),
      message: 'OK',
      success: true,
    })
  },
})
