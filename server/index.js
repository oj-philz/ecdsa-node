const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const generateKey = require("./scripts/generate.cjs");
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

let keys = generateKey();

const balances = {
  [keys[0].slice(-20)]: 100,
  [keys[1].slice(-20)]: 50,
  [keys[2].slice(-20)]: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { tx, msgHash, signature } = req.body;

  setInitialBalance(tx.sender);
  setInitialBalance(tx.recipient);

  const [sign, recoveryBit] = Uint8Array.from(Object.values(signature));

  //let pubKey = secp.recoverPublicKey(msgHash, signature, 0);
  //let addressFromPubKey = pubKey.slice(1).slice(-20);
  console.log(req.body, sign, recoveryBit);
  if (msgHash === undefined) {
    res.status(400).send({ message: "empty hash"});
  }

  /*let addresses = Object.keys(balances);
  for (let i=0; i<addresses.length; i++) {
    if (addressFromPubKey.toString() === addresses[i].toString()) continue;
    res.status(400).send({ message: "invalid sender address"});
  }*/

  if (balances[tx.sender] < tx.amount && tx.amount < 0) {
    res.status(400).send({ message: "Not enough funds! or Invalid amount" });
  } else {
    balances[tx.sender] -= tx.amount;
    balances[tx.recipient] += tx.amount;
    res.send({ balance: balances[tx.sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
console.log(keys[0].slice(-20), keys[1].slice(-20), keys[2].slice(-20));
