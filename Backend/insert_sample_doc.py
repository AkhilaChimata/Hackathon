from pymongo import MongoClient
import certifi
from urllib.parse import quote_plus

# Replace with your actual MongoDB Atlas credentials
username = quote_plus("AkhilaChimata")
password = quote_plus("Akhila@9")

# Use encoded credentials in the URI
uri = f"mongodb+srv://{username}:{password}@cluster0.t6p9qr9.mongodb.net/?retryWrites=true&w=majority"

# Connect to MongoDB Atlas
client = MongoClient(uri, tlsCAFile=certifi.where())

# Select your database and collection
db = client["ai_tutor"]
collection = db["concepts"]

# Your sample document (shortened here for clarity)
document = {
    "title": "Binary Tree",
    "text": "A binary tree is a data structure in which each node has at most two children.",
    "tags": ["data structures", "computer science"],
    "embedding": [0.333001, 0.596462, 0.933107]  # Use full embedding in your file
}

# Insert the document
collection.insert_one(document)
print("✅ Document inserted successfully!")

py fetch_snippets.py
