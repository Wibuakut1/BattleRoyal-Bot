import os
from dotenv import load_dotenv
from web3 import Web3
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

load_dotenv()

# Konfigurasi dari .env
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
SENDER_ADDRESS = os.getenv("SENDER_ADDRESS")
PHAROS_RPC = os.getenv("PHAROS_RPC", "https://testnet.dplabs-internal.com")
CHAIN_ID = int(os.getenv("CHAIN_ID", "688688"))
AMOUNT_TO_SEND = float(os.getenv("AMOUNT_TO_SEND", "0.001"))

web3 = Web3(Web3.HTTPProvider(PHAROS_RPC))

async def send_native_phrs(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        recipient = context.args[0]
        value = web3.to_wei(AMOUNT_TO_SEND, 'ether')
        nonce = web3.eth.get_transaction_count(SENDER_ADDRESS)
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
        await update.message.reply_text(f"PHRS dikirim!\nTX Hash:\n{web3.to_hex(tx_hash)}")
    except Exception as e:
        await update.message.reply_text(f"Gagal: {str(e)}")

if __name__ == "__main__":
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("send", send_native_phrs))
    app.run_polling()
