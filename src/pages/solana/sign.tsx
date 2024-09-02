import LinkText from '@/components/LinkText'
import { env } from '@/env.mjs'
import { datahubQueueRequest } from '@/server/datahub-queue/utils'
import { decryptPayload, encryptPayload } from '@/stores/encryption'
import { getCommonServerSideProps } from '@/utils/page'
import bs58 from 'bs58'
import { gql } from 'graphql-request'
import nacl from 'tweetnacl'

const LINK_IDENTITY_SOLANA_MESSAGE = gql`
  mutation LinkIdentitySolanaMessage($address: String!) {
    linkedIdentityExternalProviderSolanaProofMsg(address: $address) {
      message
    }
  }
`
async function getLinkIdentitySolanaMessage(address: string) {
  const res = await datahubQueueRequest<
    { linkedIdentityExternalProviderSolanaProofMsg: { message: string } },
    { address: string }
  >({
    document: LINK_IDENTITY_SOLANA_MESSAGE,
    variables: {
      address,
    },
  })
  return res?.linkedIdentityExternalProviderSolanaProofMsg?.message
}

export const getServerSideProps = getCommonServerSideProps(
  {},
  async (context) => {
    const signer = context.query.signer as string
    const signerNonce = context.query.signer_nonce as string
    const address = context.query.address as string
    const phantomEncryptionPublicKey = context.query
      .phantom_encryption_public_key as string
    const data = context.query.data as string
    const nonce = context.query.nonce as string

    if (
      !signer ||
      !signerNonce ||
      !address ||
      !phantomEncryptionPublicKey ||
      !data ||
      !nonce
    ) {
      return {
        redirect: {
          destination: '/tg',
          permanent: false,
        },
      }
    }

    const sharedSecretDapp = nacl.box.before(
      bs58.decode(phantomEncryptionPublicKey),
      bs58.decode(env.DAPP_SECRET_KEY)
    )
    const connectData = decryptPayload(data, nonce, sharedSecretDapp) as {
      public_key: string
      session: string
    }

    const decrypted = nacl.secretbox.open(
      Buffer.from(signer, 'hex') as unknown as Uint8Array,
      bs58.decode(signerNonce),
      bs58.decode(env.DAPP_SECRET_KEY)
    )
    if (!decrypted) {
      return {
        redirect: {
          destination: '/tg',
          permanent: false,
        },
      }
    }

    const message = await getLinkIdentitySolanaMessage(address)
    const [signNonce, encrypted] = encryptPayload(
      {
        message: bs58.encode(Buffer.from(message) as any),
        session: connectData.session,
      },
      sharedSecretDapp
    )

    const params = {
      dapp_encryption_public_key: env.NEXT_PUBLIC_DAPP_PUBLIC_KEY,
      nonce: bs58.encode(signNonce),
      payload: bs58.encode(encrypted),
      redirect_link: `https://ce9454743142.ngrok.app/solana/connect?solana_address=${connectData.public_key}&signer=${signer}&signer_nonce=${signerNonce}&address=${address}&message=${message}&phantom_encryption_public_key=${phantomEncryptionPublicKey}`,
    }

    return {
      redirect: {
        destination: `https://phantom.app/ul/v1/signMessage?${new URLSearchParams(
          params
        ).toString()}`,
        permanent: false,
      },
    }
  }
)

export default function SolanaSignPage({
  address,
  solanaAddress,
  encrypted,
  nonce,
  signer,
  signerNonce,
  phantomEncryptionPublicKey,
  message,
}: {
  address: string
  solanaAddress: string
  encrypted: string
  nonce: string
  signer: string
  phantomEncryptionPublicKey: string
  signerNonce: string
  message: string
}) {
  const params = {
    dapp_encryption_public_key: env.NEXT_PUBLIC_DAPP_PUBLIC_KEY,
    nonce,
    payload: encrypted,
    redirect_link: `https://ce9454743142.ngrok.app/solana/connect?solana_address=${solanaAddress}&signer=${signer}&signer_nonce=${signerNonce}&address=${address}&message=${message}&phantom_encryption_public_key=${phantomEncryptionPublicKey}`,
  }

  return (
    <div>
      <LinkText
        href={`https://phantom.app/ul/v1/signMessage?${new URLSearchParams(
          params
        ).toString()}`}
      >
        {`https://phantom.app/ul/v1/signMessage?${new URLSearchParams(
          params
        ).toString()}`}
      </LinkText>
    </div>
  )
}
