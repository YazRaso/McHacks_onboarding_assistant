"""
This file is designed to listen to incoming messages, send them to backboard and save them to the db.
The program requires a bot token, you can get this through telegram using botfather
"""


from dotenv import load_dotenv
import os
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    MessageHandler,
    ContextTypes,
    filters,
    ContextTypes
)
import db

load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# log_thread saves telegram messages with metadate to db, message is sent to backboard as consequence  
async def log_thread(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = update.message
    if not msg or not msg.text:
        return
    chat = msg.chat
    sender = msg.from_user or msg.sender_chat
    thread = f"{sender.username}: {msg.text}"
    # For testing purposes print(f"Thread to be added: {thread}, with id: {chat.id}, channel name: {chat.title}")
    db.create_thread(chat.id, msg.chat, thread)

app = ApplicationBuilder().token(BOT_TOKEN).build()

# Bot will register and call log_thread upon receiving messages from telegram groups
app.add_handler(MessageHandler(filters.TEXT & filters.ChatType.GROUPS, log_thread))

# App polls telegrams servers for new messages
app.run_polling()
