require('dotenv').config();
const { ethers } = require("ethers");

const RPC_URL = "https://testnet.dplabs-internal.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY belum diset di .env");
  process.exit(1);
}

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const recipients = [
  "0xAlamatTujuan1",
  "0xAlamatTujuan2",
  "0xAlamatTujuan3",
  "0xAlamatTujuan4",
  "0xAlamatTujuan5",
  "0xAlamatTujuan6",
  "0xAlamatTujuan7",
  "0xAlamatTujuan8",
  "0xAlamatTujuan9",
  "0xAlamatTujuan10",
];

async function sendTx(recipient, nonce) {
  const tx = {
    to: recipient,
    value: ethers.parseEther("0.001"),
    gasLimit: 21000,
    nonce: nonce,
  };

  try {
    const txResponse = await wallet.sendTransaction(tx);
    console.log(`Tx ke ${recipient} terkirim: ${txResponse.hash}`);
    await txResponse.wait();
  } catch (err) {
    console.error(`Gagal kirim ke ${recipient}:`, err);
  }
}

async function main() {
  let nonce = await provider.getTransactionCount(wallet.address);
  const promises = recipients.map((addr, i) => sendTx(addr, nonce + i));
  await Promise.all(promises);
}

main();
