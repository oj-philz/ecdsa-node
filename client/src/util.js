import {toHex, utf8ToBytes} from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp from "ethereum-cryptography/secp256k1";


const privateKeys = ["6df810393dc8c466872d901e727b3819bf82613a702bba705e87c12600dc3df5", 
    "5bbbcf9c5da2fee9fd48d97d68795df2581e85c5c0a4d83c1618e1e007052182", 
    "835b4c017a15c05cf56250c881c1e13583d40622bd3ab92c600ed662d25c36ef"
  ]

function hashMessage(message) {
    return keccak256(utf8ToBytes(message));
}

async function signTx(address, data) {
    for (let i=0; i<privateKeys.length; i++) {
        let pubKey = secp.getPublicKey(privateKeys[i].slice(1).slice(-20));
        if (address.toString === toHex(pubKey).toString()) {
            return await secp.sign(toHex(hashMessage(data)), privateKeys[i], {recovered: true});
        }
    }
    return [];
}

export default  util;