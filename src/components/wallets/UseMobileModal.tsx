import EvmWallets from '@/assets/graphics/eth-logo.png'
import PhantomWallet from '@/assets/graphics/phantom-wallet.png'
import Image from 'next/image'
import Button from '../Button'
import Modal, { ModalFunctionalityProps } from '../modals/Modal'

const UseMobileModal = ({
  chain,
  ...props
}: ModalFunctionalityProps & { chain: 'evm' | 'solana' }) => {
  const imagePath = chain === 'evm' ? EvmWallets : PhantomWallet

  return (
    <Modal
      {...props}
      title={`Please use your phone with ${
        chain === 'evm' ? 'EVM' : 'Phantom'
      } wallet`}
      description={'For the best experience, use your phone'}
    >
      <div className='mt-2 flex flex-col items-center gap-6'>
        <Image src={imagePath} alt='' className='h-[150px] w-[150px]' />
        <Button size='lg' className='w-full' onClick={() => props.closeModal()}>
          Got it!
        </Button>
      </div>
    </Modal>
  )
}

export default UseMobileModal
