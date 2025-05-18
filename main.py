import os
from dotenv import load_dotenv
from web3 import Web3
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
SENDER_ADDRESS = os.getenv("SENDER_ADDRESS")
PHAROS_RPC = os.getenv("PHAROS_RPC")
CHAIN_ID = int(os.getenv("CHAIN_ID", "688688"))
AMOUNT_TO_SEND = float(os.getenv("AMOUNT_TO_SEND", "0.001"))

web3 = Web3(Web3.HTTPProvider(PHAROS_RPC))

async def send(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        if not context.args:
            await update.message.reply_text("Gunakan: /send 0xAlamatTujuan")
            return

        address = context.args[0]
        if not Web3.is_address(address):
            await update.message.reply_text("Alamat tidak valid.")
            return

        to_address = Web3.to_checksum_address(address)
        nonce = web3.eth.get_transaction_count(SENDER_ADDRESS)
        value = web3.to_wei(AMOUNT_TO_SEND, "ether")
        gas_price = web3.eth.gas_price

        tx = {
            "to": to_address,
            "value": value,
            "gas": 21000,
            "gasPrice": gas_price,
            "nonce": nonce,
            "chainId": CHAIN_ID
        }

        signed = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed.rawTransaction)

        await update.message.reply_text(f"TX Hash: {web3.to_hex(tx_hash)}")
    except Exception as e:
        await update.message.reply_text(f"Gagal: {str(e)}")

async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        balance_wei = web3.eth.get_balance(SENDER_ADDRESS)
        balance = web3.from_wei(balance_wei, "ether")
        await update.message.reply_text(f"Saldo: {balance} PHRS")
    except Exception as e:
        await update.message.reply_text(f"Gagal ambil saldo: {str(e)}")

async def gas(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        gas_price = web3.eth.gas_price
        gwei = web3.from_wei(gas_price, "gwei")
        await update.message.reply_text(f"Gas Price: {gwei} Gwei")
    except Exception as e:
        await update.message.reply_text(f"Gagal ambil gas price: {str(e)}")

if __name__ == "__main__":
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("send", send))
    app.add_handler(CommandHandler("balance", balance))
    app.add_handler(CommandHandler("gas", gas))
    app.run_polling()
    
