const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const generateKey = require("./scripts/generate.cjs");
const secp = require("ethereum-cryptography/secp256k1");
const {toHex, utf8ToBytes} = require("ethereum-cryptography/utils");

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

  if(signature === undefined) {
    res.status(400).send({ message: "invalid signature" });
  }

  const [sign, recoveryBit] = signature;
  signed = new Uint8Array(Object.values(sign))
  const pubKey = toHex(secp.recoverPublicKey(msgHash, signed, recoveryBit));
  const isVerfied = secp.verify(signed, msgHash, pubKey);

  if (!isVerfied) {
    res.status(400).send({ message: "signature verification failed" });
  }

  //console.log(pubKey);
  if (msgHash === undefined) {
    res.status(400).send({ message: "empty hash"});
  }

  if (tx.sender !== pubKey.slice(-20)) {
    console.log(tx.sender, pubKey.slice(-20));
    res.status(400).send({ message: "You can't send funds from this account"});
  }

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
