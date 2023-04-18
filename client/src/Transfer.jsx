import { useState } from "react";
import server from "./server";
//import util from "./util";
import {toHex, utf8ToBytes, hexToBytes} from "ethereum-cryptography/utils";
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
    let signatures = [];
    for (let i=0; i<privateKeys.length; i++) {
        let pubKey = secp.getPublicKey(privateKeys[i].slice(1).slice(-20));
        if (address.toString === toHex(pubKey).toString()) {
            return signatures.push(await secp.sign(toHex(data), hexToBytes(privateKeys[i]), {recovered: true}));
        }
    }
    return signatures;
}


function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const tx = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    }

    const Hash = hashMessage(JSON.stringify(tx));
    const signature = signTx(address, Hash);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        tx,
        msgHash: toHex(Hash),
        signature
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>
      <h4>Sender: {address.slice(0,5)}...{address.slice(14,20)}</h4>
      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
