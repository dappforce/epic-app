import { env } from '@/env.mjs'
import { useEncryptData } from '@/services/api/mutation'
import { useMyAccount, useMyMainAddress } from '@/stores/my-account'
import { useQuery } from '@tanstack/react-query'

export default function SolanaButton() {
  const url = useGetSolanaWalletUrl()

  return (
    <LinkText href={url} className='break-all'>
      Open Solana
    </LinkText>
  )
}

export const useGetSolanaWalletUrl = () => {
  const myAddress = useMyMainAddress()
  const { mutateAsync: encrypt } = useEncryptData()
  const encodedSecretKey = useMyAccount((state) => state.encodedSecretKey)

  const { data: encryptedData, isLoading } = useQuery({
    queryKey: ['solana-connect', encodedSecretKey],
    queryFn: () => encrypt(encodedSecretKey!),
    enabled: !!encodedSecretKey,
  })

  const { encrypted, nonce } = encryptedData || {}
  const params = {
    cluster: 'mainnet-beta',
    app_url: `${env.NEXT_PUBLIC_BASE_URL}/tg`,
    dapp_encryption_public_key: env.NEXT_PUBLIC_DAPP_PUBLIC_KEY,
    redirect_link: `${env.NEXT_PUBLIC_BASE_URL}/solana/sign?signer=${encrypted}&signer_nonce=${nonce}&address=${myAddress}`,
  }
  const url = `https://phantom.app/ul/v1/connect?${new URLSearchParams(
    params
  ).toString()}`

  return url
}
