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
  const { sender, recipient, amount, msgHash, signature, recoveryBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const receiver = recipient === keys[0].slice(-20) || keys[1].slice(-20) || keys[2].slice(-20);
  const msg = new Uint8Array(Object.values(msgHash));
  const sign = new Uint8Array(Object.values(signature));

  const pubKey = secp.recoverPublicKey(msg, sign, recoveryBit);
  const isVerified = secp.verify(sign, msg, pubKey);

  if (!receiver) {
    res.status(400).send({message: "invalid recipient"});
  }

  if (!isVerified) {
    res.status(400).send({message: "message verification failed"});
  }

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
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
