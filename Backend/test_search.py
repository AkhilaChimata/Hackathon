# test_search.py

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

# Update all documents: add a 'text' field if missing
result = db.concepts.update_many(
    {"text": {"$exists": False}},
    {"$set": {"text": "No description yet."}}
)

print(f"Updated {result.modified_count} documents.")

# Debug your URI wiring
print("DEBUG: MONGO_URI ok? ", MONGODB_URI.startswith("mongodb+srv://"))

# 5) Define a sample query string
query = "binary tree data structure"

# 6) Build the Atlas Search pipeline using the text operator
pipeline = [
    {
        "$search": {
            "index": "EduStory",    # your Atlas Search index name
            "text": {
                "query": query,
                "path": ["title", "text"]
            }
        }
    },
    {
        "$project": {
            "title":      { "$ifNull": ["$title", ""] },
            "text":       { "$ifNull": ["$text", ""] },
            "score":      { "$meta": "searchScore" },
            "highlights": { "$meta": "searchHighlights" }
        }
    },
    { "$limit": 5 }
]

# 7) Run and print results
try:
    results = list(db.concepts.aggregate(pipeline))
    if not results:
        print("❌ No results—check your index or query.")
    else:
        print("✅ Top matches:\n")
        for i, doc in enumerate(results, 1):
            title      = doc.get("title", "(no title)")
            text_raw   = doc.get("text", "")
            highlights = doc.get("highlights", [])

            print(f"{i}. {title}  (score: {doc.get('score',0):.4f})")

            # Prefer to show the first highlight, if available:
            if highlights:
                snippet = highlights[0].get("text", "").replace("\n", " ")
                print("   ✨ Highlight:", snippet)
            # Otherwise, fall back to the start of the raw text:
            elif text_raw:
                snippet = text_raw.replace("\n", " ")[:100]
                print("   →", snippet + "…")
            else:
                print("   (no text field on this document)")

            print()
except Exception as e:
    print("Error during aggregation:", e)
