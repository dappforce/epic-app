import bs58 from 'bs58'
import nacl from 'tweetnacl'

const pair = nacl.box.keyPair()
console.log(`Public Key: ${bs58.encode(pair.publicKey)}`)
console.log(`Secret Key: ${bs58.encode(pair.secretKey)}`)
