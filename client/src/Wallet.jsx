import server from './server'
import * as secp from 'ethereum-cryptography/secp256k1'
import { recoverPublicKey } from 'ethereum-cryptography/secp256k1'
import {
  toHex,
  utf8ToBytes,
  hexToBytes,
  bytesToUtf8,
  bytesToHex,
} from 'ethereum-cryptography/utils'
import { keccak256 } from 'ethereum-cryptography/keccak'

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  signature,
  setSignature,
  publicKey,
  setPublicKey,
}) {
  const getRecoveryBit = (signature) => {
    const lastByte = signature[signature.length - 1]
    let recovery = (27 - lastByte) % 27
    return Math.abs(recovery % 2)
  }
  const getPublicKey = (signature, recoveryBit) => {
    const hash = keccak256(utf8ToBytes('send money'))

    let hexToSig = bytesToUtf8(hexToBytes(signature))
      .split(',')
      .map((x) => parseInt(x))
    // let recoveryBit = hexToSig.pop()
    // console.log('Recovery bit: ', recoveryBit)

    hexToSig = new Uint8Array(hexToSig)
    console.log('Hex to signature (array): ', hexToSig)

    const pk = secp.recoverPublicKey(hash, hexToSig, getRecoveryBit(hexToSig))
    console.log('recovered public key: ', toHex(pk))
    return toHex(pk)
  }
  async function onChange(evt) {
    const signature = evt.target.value
    setSignature(signature)
    const publicKey = getPublicKey(signature, 1)
    const address = await publicKey
    setAddress(address)

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`)
      setBalance(balance)
    } else {
      setBalance(0)
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Enter your signature
        <input
          placeholder="Enter signature"
          value={signature}
          onChange={onChange}
        ></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  )
}

export default Wallet
