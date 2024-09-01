import hashlib
import requests
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend

with open('session_key.txt', 'r') as file:
    key_long = file.read().strip()

with open('clipublicValue.txt', 'r') as file:
    plaintext_hex = file.read().strip()
    plaintext = bytes.fromhex(plaintext_hex)

key = hashlib.sha256(key_long.encode()).digest()

iv = b'\x00' * 16
cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
encryptor = cipher.encryptor()

padder = padding.PKCS7(algorithms.AES.block_size).padder()
padded_data = padder.update(plaintext) + padder.finalize()
ciphertext = encryptor.update(padded_data) + encryptor.finalize()

ciphertext_hex = ciphertext.hex()

response = requests.post('http://localhost:8000', data={'encrypted_data': ciphertext_hex})
print("Server response:", response.text)
