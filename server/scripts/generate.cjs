const secp = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils');
const env = require('dotenv').config();

function generateKey() {
    let i = 0;
    const publicKey1 = toHex(secp.getPublicKey(process.env.key1));
    const publicKey2 = toHex(secp.getPublicKey(process.env.key2));
    const publicKey3 = toHex(secp.getPublicKey(process.env.key3));
    return [publicKey1, publicKey2, publicKey3];

}

module.exports = generateKey;