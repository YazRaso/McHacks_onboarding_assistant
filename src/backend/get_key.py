# This program is designed to generate a private key for the encryption module
from cryptography.fernet import Fernet

print(Fernet.generate_key().decode())
