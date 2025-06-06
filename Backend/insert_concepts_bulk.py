import json
from pymongo import MongoClient
import certifi
from urllib.parse import quote_plus

# MongoDB credentials (update safely)
username = quote_plus("AkhilaChimata")
password = quote_plus("Akhila@9")
uri = f"mongodb+srv://{username}:{password}@cluster0.t6p9qr9.mongodb.net/"

# Connect to MongoDB
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client["ai_tutor"]
collection = db["concepts"]

# Load and transform JSON data
with open("cs_topics.json", "r") as file:
    topics = json.load(file)

data = [{"title": topic} for topic in topics]  # Transform to list of dicts

# Insert into MongoDB
collection.insert_many(data)
print("✅ Topics inserted successfully!")
