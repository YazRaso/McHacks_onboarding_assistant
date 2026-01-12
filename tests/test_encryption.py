"""
Tests for encryption.py - Encryption utility functions.
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from cryptography.fernet import Fernet

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'backend'))


class TestEncryptApiKey:
    """Tests for encrypt_api_key function."""

    def test_encrypt_api_key_returns_string(self, encryption_key):
        """Test that encrypt_api_key returns a string."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            # Reimport to get fresh module with new env
            import importlib
            import encryption
            importlib.reload(encryption)

            result = encryption.encrypt_api_key("test_api_key")

            assert isinstance(result, str)

    def test_encrypt_api_key_returns_different_from_input(self, encryption_key):
        """Test that encrypted key is different from original."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            original = "test_api_key"
            encrypted = encryption.encrypt_api_key(original)

            assert encrypted != original

    def test_encrypt_api_key_produces_valid_fernet_token(self, encryption_key):
        """Test that encrypted key is a valid Fernet token."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            encrypted = encryption.encrypt_api_key("test_api_key")

            # Valid Fernet tokens can be decoded from base64
            fernet = Fernet(encryption_key.encode())
            decrypted = fernet.decrypt(encrypted.encode())
            assert decrypted == b"test_api_key"

    def test_encrypt_api_key_with_empty_string(self, encryption_key):
        """Test encrypting an empty string."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            encrypted = encryption.encrypt_api_key("")

            assert isinstance(encrypted, str)
            assert len(encrypted) > 0

    def test_encrypt_api_key_with_special_characters(self, encryption_key):
        """Test encrypting a string with special characters."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            special_key = "key!@#$%^&*()_+-=[]{}|;':\",./<>?"
            encrypted = encryption.encrypt_api_key(special_key)

            assert isinstance(encrypted, str)

    def test_encrypt_api_key_with_unicode(self, encryption_key):
        """Test encrypting a string with unicode characters."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            unicode_key = "key_with_unicode_\u00e9\u00e8\u00ea"
            encrypted = encryption.encrypt_api_key(unicode_key)

            assert isinstance(encrypted, str)


class TestDecryptApiKey:
    """Tests for decrypt_api_key function."""

    def test_decrypt_api_key_returns_original(self, encryption_key):
        """Test that decrypt_api_key returns the original value."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            original = "test_api_key"
            encrypted = encryption.encrypt_api_key(original)
            decrypted = encryption.decrypt_api_key(encrypted)

            assert decrypted == original

    def test_decrypt_api_key_returns_string(self, encryption_key):
        """Test that decrypt_api_key returns a string."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            encrypted = encryption.encrypt_api_key("test")
            decrypted = encryption.decrypt_api_key(encrypted)

            assert isinstance(decrypted, str)

    def test_decrypt_api_key_with_empty_encrypted_string(self, encryption_key):
        """Test decrypting what was originally an empty string."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            encrypted = encryption.encrypt_api_key("")
            decrypted = encryption.decrypt_api_key(encrypted)

            assert decrypted == ""

    def test_decrypt_api_key_with_special_characters(self, encryption_key):
        """Test decrypting a string that had special characters."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            special_key = "key!@#$%^&*()_+-=[]{}|;':\",./<>?"
            encrypted = encryption.encrypt_api_key(special_key)
            decrypted = encryption.decrypt_api_key(encrypted)

            assert decrypted == special_key

    def test_decrypt_api_key_with_unicode(self, encryption_key):
        """Test decrypting a string that had unicode characters."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            unicode_key = "key_with_unicode_\u00e9\u00e8\u00ea"
            encrypted = encryption.encrypt_api_key(unicode_key)
            decrypted = encryption.decrypt_api_key(encrypted)

            assert decrypted == unicode_key

    def test_decrypt_api_key_with_long_string(self, encryption_key):
        """Test encrypting and decrypting a long string."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            long_key = "A" * 10000
            encrypted = encryption.encrypt_api_key(long_key)
            decrypted = encryption.decrypt_api_key(encrypted)

            assert decrypted == long_key


class TestEncryptionRoundTrip:
    """Tests for encryption/decryption round trip."""

    def test_multiple_encryptions_produce_different_outputs(self, encryption_key):
        """Test that encrypting the same value twice produces different ciphertexts."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            original = "test_api_key"
            encrypted1 = encryption.encrypt_api_key(original)
            encrypted2 = encryption.encrypt_api_key(original)

            # Fernet includes a timestamp and IV, so same plaintext produces different ciphertext
            assert encrypted1 != encrypted2

    def test_both_different_ciphertexts_decrypt_to_same_value(self, encryption_key):
        """Test that different ciphertexts of same value decrypt correctly."""
        with patch.dict(os.environ, {"ENCRYPTION_KEY": encryption_key}):
            import importlib
            import encryption
            importlib.reload(encryption)

            original = "test_api_key"
            encrypted1 = encryption.encrypt_api_key(original)
            encrypted2 = encryption.encrypt_api_key(original)

            decrypted1 = encryption.decrypt_api_key(encrypted1)
            decrypted2 = encryption.decrypt_api_key(encrypted2)

            assert decrypted1 == decrypted2 == original
