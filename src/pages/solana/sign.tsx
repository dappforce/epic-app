import Button from '@/components/Button'
import Container from '@/components/Container'
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

    const errorMessage = context.query.errorMessage as string
    if (errorMessage) {
      return {
        props: {
          error: errorMessage,
        },
      }
    }

    if (
      !signer ||
      !signerNonce ||
      !address ||
      !phantomEncryptionPublicKey ||
      !data ||
      !nonce
    ) {
      return {
        props: {
          error: 'Missing required parameters',
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
        props: {
          error: 'Bad Request',
        },
      }
    }

    const message = await getLinkIdentitySolanaMessage(connectData.public_key)
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
      redirect_link: `${env.NEXT_PUBLIC_BASE_URL}/solana/connect?solana_address=${connectData.public_key}&signer=${signer}&signer_nonce=${signerNonce}&address=${address}&message=${message}&phantom_encryption_public_key=${phantomEncryptionPublicKey}`,
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

export default function SolanaSignPage(
  props:
    | {
        address: string
        solanaAddress: string
        encrypted: string
        nonce: string
        signer: string
        phantomEncryptionPublicKey: string
        signerNonce: string
        message: string
      }
    | { error: string }
) {
  if ('error' in props) {
    return (
      <Container className='flex h-screen w-full flex-col items-center justify-center text-center'>
        <h1 className='text-2xl font-bold'>
          Uh-oh! 🚫 Something went wrong with the wallet verification process.
          Give it another try!
        </h1>
        <p className='mt-3 text-text-muted'>{props.error}</p>

        <Button
          className='mt-6'
          size='lg'
          href={`tg://resolve?domain=${env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}`}
        >
          Retry Verification
        </Button>
      </Container>
    )
  }

  const {
    address,
    solanaAddress,
    encrypted,
    nonce,
    signer,
    signerNonce,
    phantomEncryptionPublicKey,
    message,
  } = props

  const params = {
    dapp_encryption_public_key: env.NEXT_PUBLIC_DAPP_PUBLIC_KEY,
    nonce,
    payload: encrypted,
    redirect_link: `${env.NEXT_PUBLIC_BASE_URL}/solana/connect?solana_address=${solanaAddress}&signer=${signer}&signer_nonce=${signerNonce}&address=${address}&message=${message}&phantom_encryption_public_key=${phantomEncryptionPublicKey}`,
  }

  return (
    <Container className='flex h-screen w-full flex-col items-center justify-center text-center'>
      <h1 className='text-2xl font-bold'>Verify your Solana Address</h1>
      <p className='mt-3 text-text-muted'>
        Your Solana address: {solanaAddress}
      </p>

      <Button
        className='mt-6'
        size='lg'
        href={`https://phantom.app/ul/v1/signMessage?${new URLSearchParams(
          params
        ).toString()}`}
      >
        Verify
      </Button>
    </Container>
  )
}
