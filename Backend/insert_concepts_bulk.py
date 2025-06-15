import json
from pymongo import MongoClient
import certifi
from urllib.parse import quote_plus

# MongoDB credentials
username = quote_plus("AkhilaChimata")
password = quote_plus("Akhila@9")
uri = f"mongodb+srv://{username}:{password}@cluster0.t6p9qr9.mongodb.net/"

# Connect to MongoDB
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client["ai_tutor"]
collection = db["concepts"]

# Clear the collection first
collection.delete_many({})
print("✅ Cleared the concepts collection.")

# Load topics with descriptions
with open("cs_snippets.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Insert into MongoDB
collection.insert_many(data)
print("✅ Topics with descriptions inserted successfully!")
