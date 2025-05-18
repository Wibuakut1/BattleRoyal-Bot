require('dotenv').config();
const { ethers } = require("ethers");
const fs = require('fs');

const RPC_URL = "https://testnet.dplabs-internal.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY belum diset di .env");
  process.exit(1);
}

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Baca daftar alamat dari file recipients.txt
const recipients = fs.readFileSync("recipients.txt", "utf-8")
  .split("\n")
  .map(line => line.trim())
  .filter(addr => addr.length > 0 && addr.startsWith("0x"));

function randomDelay() {
  const ms = Math.floor(Math.random() * 1000) + 2000; // antara 2000-3000 ms
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    console.log(`Mengirim tx ke ${recipient} (nonce: ${nonce + i})`);
    await sendTx(recipient, nonce + i);

    if (i < recipients.length - 1) {
      console.log("Tunggu 2-3 detik sebelum kirim berikutnya...");
      await randomDelay();
    }
  }

  console.log("Semua transaksi selesai dikirim.");
}

main();
