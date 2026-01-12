"""
Tests for db.py - Database utility functions.
"""
import os
import sys
import sqlite3
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'backend'))


class TestGetConnection:
    """Tests for get_connection function."""

    def test_get_connection_returns_connection(self, temp_db):
        """Test that get_connection returns a valid sqlite3 connection."""
        with patch('db.sqlite3.connect') as mock_connect:
            mock_con = MagicMock(spec=sqlite3.Connection)
            mock_connect.return_value = mock_con

            import db
            result = db.get_connection()

            mock_connect.assert_called_once_with("demo.db")
            assert mock_con.row_factory == sqlite3.Row

    def test_get_connection_sets_row_factory(self, temp_db):
        """Test that row_factory is set to sqlite3.Row."""
        with patch('db.sqlite3.connect') as mock_connect:
            mock_con = MagicMock(spec=sqlite3.Connection)
            mock_connect.return_value = mock_con

            import db
            db.get_connection()

            assert mock_con.row_factory == sqlite3.Row


class TestClientFunctions:
    """Tests for client-related database functions."""

    def test_lookup_client_returns_client_when_exists(self, temp_db):
        """Test lookup_client returns client data when client exists."""
        # Setup: Insert a test client directly
        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("INSERT INTO clients (client_id, api_key) VALUES (?, ?)",
                    ("test_client", "test_api_key"))
        con.commit()
        con.close()

        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            result = db.lookup_client("test_client")

            assert result is not None
            assert result['client_id'] == "test_client"
            assert result['api_key'] == "test_api_key"

    def test_lookup_client_returns_none_when_not_exists(self, temp_db):
        """Test lookup_client returns None when client does not exist."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            result = db.lookup_client("nonexistent_client")

            assert result is None

    def test_create_client_inserts_new_client(self, temp_db):
        """Test create_client successfully inserts a new client."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            db.create_client("new_client", "new_api_key")

        # Verify insertion
        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("SELECT * FROM clients WHERE client_id = ?", ("new_client",))
        result = cur.fetchone()
        con.close()

        assert result is not None
        assert result[0] == "new_client"
        assert result[1] == "new_api_key"

    def test_create_client_with_special_characters(self, temp_db):
        """Test create_client handles special characters in api_key."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            special_key = "key!@#$%^&*()_+-=[]{}|;':\",./<>?"
            db.create_client("special_client", special_key)

        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("SELECT api_key FROM clients WHERE client_id = ?", ("special_client",))
        result = cur.fetchone()
        con.close()

        assert result[0] == special_key


class TestAssistantFunctions:
    """Tests for assistant-related database functions."""

    def test_lookup_assistant_returns_assistant_when_exists(self, temp_db):
        """Test lookup_assistant returns assistant data when exists."""
        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("INSERT INTO assistants (assistant_id, client_id) VALUES (?, ?)",
                    ("test_assistant", "test_client"))
        con.commit()
        con.close()

        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            result = db.lookup_assistant("test_client")

            assert result is not None
            assert result['assistant_id'] == "test_assistant"
            assert result['client_id'] == "test_client"

    def test_lookup_assistant_returns_none_when_not_exists(self, temp_db):
        """Test lookup_assistant returns None when assistant does not exist."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            result = db.lookup_assistant("nonexistent_client")

            assert result is None

    def test_create_assistant_inserts_new_assistant(self, temp_db):
        """Test create_assistant successfully inserts a new assistant."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            db.create_assistant("new_assistant", "new_client")

        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("SELECT * FROM assistants WHERE assistant_id = ?", ("new_assistant",))
        result = cur.fetchone()
        con.close()

        assert result is not None
        assert result[0] == "new_assistant"
        assert result[1] == "new_client"


class TestThreadFunctions:
    """Tests for thread/chat-related database functions."""

    def test_lookup_thread_returns_thread_when_exists(self, temp_db):
        """Test lookup_thread returns chat data when exists."""
        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("INSERT INTO chats (chat_id, channel_name, chat) VALUES (?, ?, ?)",
                    ("test_chat_id", "test_channel", "test message"))
        con.commit()
        con.close()

        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            result = db.lookup_thread("test_chat_id")

            assert result is not None
            assert result['chat_id'] == "test_chat_id"
            assert result['channel_name'] == "test_channel"
            assert result['chat'] == "test message"

    def test_lookup_thread_returns_none_when_not_exists(self, temp_db):
        """Test lookup_thread returns None when chat does not exist."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            result = db.lookup_thread("nonexistent_chat")

            assert result is None

    def test_create_thread_inserts_new_thread(self, temp_db):
        """Test create_thread successfully inserts a new chat."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            db.create_thread("new_chat_id", "new_channel", "new message content")

        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("SELECT * FROM chats WHERE chat_id = ?", ("new_chat_id",))
        result = cur.fetchone()
        con.close()

        assert result is not None
        assert result[0] == "new_chat_id"
        assert result[1] == "new_channel"
        assert result[2] == "new message content"

    def test_create_thread_with_long_message(self, temp_db):
        """Test create_thread handles long messages."""
        with patch('db.get_connection') as mock_get_conn:
            con = sqlite3.connect(temp_db)
            con.row_factory = sqlite3.Row
            mock_get_conn.return_value = con

            import db
            long_message = "A" * 10000
            db.create_thread("long_chat_id", "channel", long_message)

        con = sqlite3.connect(temp_db)
        cur = con.cursor()
        cur.execute("SELECT chat FROM chats WHERE chat_id = ?", ("long_chat_id",))
        result = cur.fetchone()
        con.close()

        assert result[0] == long_message
