import hashlib
import requests
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.backends import default_backend
import os
import random

def suitable_secret_from_key(key_decimal, p):
    max_secret = 0
    length = len(str(key_decimal))
    
    for i in range(length):
        current_secret = key_decimal % (10 ** (i + 1))
        if current_secret < (p - 1) and current_secret > max_secret:
            max_secret = current_secret
    return max_secret

def get_suitable_secret_from_hex_key(hex_key, p):
    key_decimal = int(hex_key, 16)
    return suitable_secret_from_key(key_decimal, p)

g = 2
p = int("E4911D9B70F5E67B331530F6A0E4C767BEB496022333432ED4D27BA8A77D5D63", 16)

with open('/home/burdock/ICEA/did/DIDWEB-CLI/cliprikey.txt', 'r') as file:
    cli_key = file.read().strip()

random_seed = random.SystemRandom().randint(1, p-1)
with open('random.txt', 'w') as f:
    f.write(str(random_seed))

cli_secret = get_suitable_secret_from_hex_key(cli_key, p) + random_seed
shared_key = pow(g, cli_secret, p)

response = requests.post('http://localhost:8000/receive_shared_key', json={'shared_key': str(shared_key)})
print("Server response:", response.text)
