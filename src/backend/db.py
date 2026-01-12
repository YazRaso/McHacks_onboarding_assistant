"""
This program is designed to setup demo.db as well as utility functions
Three tables are created
    -   clients
    -   assistants
    -   chats
Each table has a lookup and a create function
    -   lookup functions check if the input exists
    -   create functions add the input to the db
"""
import sqlite3

con = sqlite3.connect("demo.db")
cur = con.cursor()

# Create tables
cur.execute("""
    CREATE TABLE IF NOT EXISTS clients (
        client_id TEXT PRIMARY KEY,
        api_key TEXT
    )
""")

cur.execute("""
    CREATE TABLE IF NOT EXISTS assistants (
        assistant_id TEXT PRIMARY KEY,
        client_id TEXT
    )
""")

cur.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        chat_id TEXT PRIMARY KEY,
        channel_name TEXT,
        chat TEXT
    )
""")

def get_connection():
    con = sqlite3.connect("demo.db")
    con.row_factory = sqlite3.Row
    return con

# client functions
def lookup_client(client_id: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        SELECT * FROM clients WHERE client_id = ?
    """, (client_id,))
    client = cur.fetchone()
    con.close()
    return dict(client) if client else None

def create_client(client_id: str, api_key: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        INSERT INTO clients (client_id, api_key) VALUES (?, ?)
    """, (client_id, str(api_key)))
    con.commit()
    con.close()

# Assistant functions
def lookup_assistant(client_id: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        SELECT * FROM assistants WHERE client_id = ?
    """, (client_id,))
    assistant = cur.fetchone()
    con.close()
    return dict(assistant) if assistant else None

def create_assistant(assistant_id: str, client_id: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        INSERT INTO assistants (assistant_id, client_id) VALUES (?, ?)
""", (str(assistant_id), client_id))
    con.commit()
    con.close()

# Thread functions
def lookup_thread(chat_id: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        SELECT * FROM chats WHERE chat_id = ?
    """, (chat_id,))
    chat = cur.fetchone()
    con.close()
    return dict(chat) if chat else None

def create_thread(chat_id: str, channel_name: str, chat: str):
    con = get_connection()
    con.row_factory = sqlite3.Row
    cur = con.cursor()
    cur.execute("""
        INSERT INTO chats (chat_id, channel_name, chat) VALUES (?, ?, ?)
    """, (chat_id, channel_name, chat))
    con.commit()
    con.close()
