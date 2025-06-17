# minimal_mongo_test.py

import ssl
from pymongo import MongoClient
import certifi
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

# 1) Check OpenSSL version
print("OpenSSL version:", ssl.OPENSSL_VERSION)

# 2) Load our .env creds
load_dotenv()
user   = os.getenv("MONGO_USER")
passwd = os.getenv("MONGO_PASS")
host   = os.getenv("MONGO_HOST")
dbname = "ai_tutor"

# 3) Build the URI
user_enc   = quote_plus(user)
passwd_enc = quote_plus(passwd)
uri = (
    f"mongodb+srv://{user_enc}:{passwd_enc}@{host}/{dbname}"
    "?retryWrites=true&w=majority"
)

print("Testing connection to:", host)

# 4) Try connecting with a 5-second timeout
try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    info = client.server_info()  # this will force a server round-trip
    print("✅ Connected! Server info:")
    print("   version:", info["version"])
except Exception as e:
    print("❌ Connection failed:")
    print(e)
