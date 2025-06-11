# test_search.py

from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
from pymongo import MongoClient
import certifi

# 1) Load our .env
load_dotenv()

# 2) Read Mongo creds from env
user   = os.getenv("MONGO_USER")
passwd = os.getenv("MONGO_PASS")
host   = os.getenv("MONGO_HOST")    # e.g. cluster0.t6p9qr9.mongodb.net
dbname = "ai_tutor"

# 3) Percent-encode and build the full URI
user_enc   = quote_plus(user)
passwd_enc = quote_plus(passwd)
MONGODB_URI = (
    f"mongodb+srv://{user_enc}:{passwd_enc}@{host}/{dbname}"
    "?retryWrites=true&w=majority&tls=true"
)

# 4) Connect with explicit CA bundle for Atlas TLS
client = MongoClient(
    MONGODB_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=20000
)
db = client[dbname]

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
