from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()
user   = os.getenv("MONGO_USER")
passwd = os.getenv("MONGO_PASS")
host   = os.getenv("MONGO_HOST")
dbname = "ai_tutor"

user_enc   = quote_plus(user)
passwd_enc = quote_plus(passwd)
MONGODB_URI = (
    f"mongodb+srv://{user_enc}:{passwd_enc}@{host}/{dbname}"
    "?retryWrites=true&w=majority&tls=true"
)

client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client[dbname]

# Update all documents: add a 'text' field to every document
result = db.concepts.update_many(
    {},
    {"$set": {"text": "No description yet."}}
)
print(f"Updated {result.modified_count} documents.")