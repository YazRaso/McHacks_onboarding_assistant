"""
Shared fixtures for tests.
"""
import os
import sys
import sqlite3
import tempfile
import pytest
from unittest.mock import patch, MagicMock
from cryptography.fernet import Fernet

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'backend'))


@pytest.fixture
def temp_db(tmp_path):
    """Create a temporary database for testing."""
    db_path = tmp_path / "test.db"
    con = sqlite3.connect(str(db_path))
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
    con.commit()
    con.close()

    return str(db_path)


@pytest.fixture
def encryption_key():
    """Generate a valid Fernet encryption key for testing."""
    return Fernet.generate_key().decode()


@pytest.fixture
def mock_env(encryption_key):
    """Mock environment variables for testing."""
    with patch.dict(os.environ, {
        "ENCRYPTION_KEY": encryption_key,
        "BOT_TOKEN": "test_bot_token"
    }):
        yield


@pytest.fixture
def mock_backboard_client():
    """Mock the BackboardClient for testing."""
    mock_client = MagicMock()
    mock_assistant = MagicMock()
    mock_assistant.assistant_id = "test_assistant_id"
    mock_client.create_assistant = MagicMock(return_value=mock_assistant)

    mock_thread = MagicMock()
    mock_thread.thread_id = "test_thread_id"
    mock_client.create_thread = MagicMock(return_value=mock_thread)

    return mock_client
