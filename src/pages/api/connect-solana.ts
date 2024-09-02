import { env } from '@/env.mjs'
import { handlerWrapper } from '@/server/common'
import { addExternalProviderToIdentity } from '@/server/datahub-queue/identity'
import { createSocialDataEventPayload } from '@/services/datahub/utils'
import { decodeSecretKey, loginWithSecretKey } from '@/utils/account'
import { IdentityProvider } from '@subsocial/data-hub-sdk'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { z } from 'zod'

export default handlerWrapper({
  dataGetter: (req) => req.body,
  inputSchema: z.object({
    solana_address: z.string().min(1),
    signer: z.string().min(1),
    signer_nonce: z.string().min(1),
    address: z.string().min(1),
    message: z.string().min(1),
    signature: z.string().min(1),
  }),
})({
  errorLabel: 'solana-connect',
  allowedMethods: ['POST'],
  handler: async (data, _, res) => {
    const {
      address,
      message,
      signature,
      signer: signerKey,
      signer_nonce: signerNonce,
      solana_address: solanaAddress,
    } = data

    const decryptRes = nacl.secretbox.open(
      Buffer.from(signerKey, 'hex') as unknown as Uint8Array,
      bs58.decode(signerNonce),
      bs58.decode(env.DAPP_SECRET_KEY)
    )
    if (!decryptRes) {
      return res.status(400).json({ message: 'Bad Request', success: false })
    }

    const secretKey = decodeSecretKey(Buffer.from(decryptRes).toString())
    const signer = await loginWithSecretKey(secretKey)
    await addExternalProviderToIdentity(
      await createSocialDataEventPayload(
        'synth_add_linked_identity_external_provider',
        {
          address: signer.address,
          proxyToAddress: address,
        },
        {
          externalProvider: {
            id: solanaAddress,
            provider: IdentityProvider.SOLANA,
            solProofMsg: message,
            solProofMsgSig: signature,
          },
        }
      )
    )

    return res.status(200).json({ message: 'OK', success: true })
  },
})
