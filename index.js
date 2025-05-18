require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { ethers } = require('ethers');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const OWNER_ID = 'YOUR_DISCORD_ID'; // Ganti dengan ID kamu

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!faucet')) return;
  if (message.author.id !== OWNER_ID) return message.reply('Kamu tidak diizinkan menggunakan bot ini.');

  const args = message.content.split(' ');
  if (args.length !== 2) return message.reply('Gunakan format: `!faucet <alamat>`');

  const to = args[1];
  if (!ethers.isAddress(to)) return message.reply('Alamat tidak valid.');

  try {
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther("0.001")
    });
    const log = `[${new Date().toISOString()}] ${message.author.tag} meminta token ke ${to} | Tx Hash: ${tx.hash}\n`;
    fs.appendFileSync('log.txt', log);
    console.log(log);
    message.reply(`Token terkirim!\nTx Hash: https://testnet.pharosscan.xyz/tx/${tx.hash}`);
  } catch (err) {
    console.error(err);
    message.reply('Gagal mengirim token. Cek saldo wallet & alamat.');
  }
});

client.login(process.env.DISCORD_TOKEN);