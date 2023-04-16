const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const env = require('dotenv').config();

const keys = [];
keys.push(process.env.key1);
keys.push(process.env.key2);
keys.push(process.env.key3);

let key = "";

function hashMessage(message) {
    for (let i=0; i<keys.length; i++) {
        if (message.sender === toHex(secp.getPublicKey(keys[i])).toString().slice(-20)) {
            key = keys[i];
            const bytes = utf8ToBytes(JSON.stringify(message));
            const hash = keccak256(bytes);
            return hash;
        } else {
            return null;
        }
    }
}

async function signMessage(message) {
    return await (secp.sign(hashMessage(message), key, {recovered: true})); 
}

//console.log(signMessage({sender: "862edfc3626725e0151e", amount: "5", receiver: "92deffdb099e31d22cdd"}));
//console.log(hashMessage({sender: "862edfc3626725e0151e", amount: "5", receiver: "92deffdb099e31d22cdd"}));
module.exports = signMessage, hashMessage;