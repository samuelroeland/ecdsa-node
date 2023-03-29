const secp = require("ethereum-cryptography/secp256k1");
const {
  toHex,
  utf8ToBytes,
  hexToBytes,
  bytesToUtf8,
  bytesToHex,
} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();
console.log("Private Key: ", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);
console.log("Public Key: ", toHex(publicKey));

const hash = keccak256(utf8ToBytes("send money"));
console.log("Hash: ", hash);

const signature = secp.signSync(toHex(hash), privateKey, { required: true });
console.log("Signature: ", signature);

let sig;
(async () => {
  sig = await secp.sign(toHex(hash), privateKey, { recovered: true });
})();

console.log("sigie: ", sig);

const isVerified = secp.verify(signature, toHex(hash), toHex(publicKey));
console.log("Is verified: ", isVerified);

// const recovered = secp.recoverPublicKey(hash, signature, 0);
// console.log("recovered pk: ", recovered);

// ----------------
// Convert a signature from a hex back to a signature

const sigHex = toHex(utf8ToBytes(signature.toString()));
console.log("Signature in hex: ", sigHex);
let hexToSig = bytesToUtf8(hexToBytes(sigHex))
  .split(",")
  .map((x) => parseInt(x));

// let recoveryBit = hexToSig.pop();
// console.log("Recovery bit: ", recoveryBit);

hexToSig = new Uint8Array(hexToSig);

console.log("Hex to sig: ", hexToSig);

const getRecoveryBit = (signature) => {
  const lastByte = signature[signature.length - 1];
  let recovery = (27 - lastByte) % 27;
  return Math.abs(recovery % 2);
};

console.log("Recovery Bit: ", getRecoveryBit(hexToSig));

const pk = secp.recoverPublicKey(hash, hexToSig, getRecoveryBit(hexToSig));
console.log("recovered public key: ", toHex(pk));

const isSigned = secp.verify(signature, toHex(hash), toHex(pk));
console.log("from recovery is signed: ", isSigned);
