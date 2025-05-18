import os
from dotenv import load_dotenv
from web3 import Web3
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
SENDER_ADDRESS = os.getenv("SENDER_ADDRESS")
PHAROS_RPC = os.getenv("PHAROS_RPC", "https://testnet.dplabs-internal.com")
CHAIN_ID = int(os.getenv("CHAIN_ID", "688688"))
AMOUNT_TO_SEND = float(os.getenv("AMOUNT_TO_SEND", "0.001"))

web3 = Web3(Web3.HTTPProvider(PHAROS_RPC))

# Pastikan sender checksum address
sender = Web3.to_checksum_address(SENDER_ADDRESS)

async def send_native_phrs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        if not context.args:
            await update.message.reply_text("Format perintah:\n`/send 0xAlamatTujuan`", parse_mode="Markdown")
            return

        raw_recipient = context.args[0]
        if not Web3.is_address(raw_recipient):
            await update.message.reply_text("Alamat tidak valid. Harus diawali `0x` dan memiliki 40 karakter hex.", parse_mode="Markdown")
            return

        recipient = Web3.to_checksum_address(raw_recipient)
        value = web3.to_wei(AMOUNT_TO_SEND, 'ether')
        nonce = web3.eth.get_transaction_count(sender)

        tx = {
            'to': recipient,
            'value': value,
            'gas': 21000,
            'gasPrice': web3.to_wei('2', 'gwei'),
            'nonce': nonce,
            'chainId': CHAIN_ID
        }

        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

        await update.message.reply_text(
            f"PHRS dikirim ke `{recipient}`\n\nTX Hash:\n`{web3.to_hex(tx_hash)}`",
            parse_mode="Markdown"
        )
    except Exception as e:
        await update.message.reply_text(f"Gagal: `{str(e)}`", parse_mode="Markdown")

async def get_balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        balance_wei = web3.eth.get_balance(sender)
        balance_phrs = web3.from_wei(balance_wei, 'ether')
        await update.message.reply_text(f"Saldo wallet kamu: `{balance_phrs}` PHRS", parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Gagal ambil saldo: `{str(e)}`", parse_mode="Markdown")

async def get_gas_price(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        gas_price_wei = web3.eth.gas_price
        gas_price_gwei = web3.from_wei(gas_price_wei, 'gwei')
        await update.message.reply_text(f"Harga gas saat ini: `{gas_price_gwei}` Gwei", parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Gagal ambil gas price: `{str(e)}`", parse_mode="Markdown")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = """
Perintah bot:
/send 0xAlamatTujuan - Kirim 0.001 PHRS ke alamat tujuan
/balance - Cek saldo wallet pengirim
/gas - Cek harga gas saat ini
/help - Tampilkan pesan ini
"""
    await update.message.reply_text(help_text)

if __name__ == "__main__":
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("send", send_native_phrs))
    app.add_handler(CommandHandler("balance", get_balance))
    app.add_handler(CommandHandler("gas", get_gas_price))
    app.add_handler(CommandHandler("help", help_command))
    app.run_polling()
    
