# embed_text_vertexai.py

# 1) Load per-project secrets
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
from pymongo import MongoClient   # in case you also connect here

load_dotenv()  # reads backend/.env

# 2) Build and percent-encode your Mongo URI
user     = os.getenv("MONGO_USER")
passwd   = os.getenv("MONGO_PASS")
host     = os.getenv("MONGO_HOST")
dbname   = "ai_tutor"

user_enc   = quote_plus(user)
passwd_enc = quote_plus(passwd)

MONGODB_URI = (
    f"mongodb+srv://{user_enc}:{passwd_enc}@{host}/{dbname}"
    "?retryWrites=true&w=majority"
)

# 3) (Optional) verify
print("DEBUG: MONGO_URI ok?", MONGODB_URI.startswith("mongodb+srv://"))

# 4) Set up GCP credentials for Vertex AI
GCP_SA_KEY_PATH = os.getenv("GCP_SA_KEY_PATH")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_SA_KEY_PATH
print("DEBUG: GCP key found?", os.path.exists(GCP_SA_KEY_PATH))

# 5) Now import and use Vertex AI normally
import vertexai
from vertexai.preview.language_models import TextEmbeddingModel

# Replace with your actual Google Cloud project ID and region
PROJECT_ID = "edustory-hackathon"
LOCATION   = "us-central1"

def get_embedding(text: str):
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = TextEmbeddingModel.from_pretrained("text-embedding-005")
    embeddings = model.get_embeddings([text])
    return embeddings[0].values

# Quick smoke test
if __name__ == "__main__":
    v = get_embedding("Test embedding for a binary tree.")
    print("✅ Embedding length:", len(v))
    print("🔢 First 5 values:", v[:5])
