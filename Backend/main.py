# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
from pymongo import MongoClient
import certifi
import vertexai
from vertexai.preview.language_models import TextEmbeddingModel

# ——— Load env & creds ———
load_dotenv()
# Mongo connection pieces
user   = os.getenv("MONGO_USER")
passwd = os.getenv("MONGO_PASS")
host   = os.getenv("MONGO_HOST")
dbname = "ai_tutor"

# Build and encode URI
user_enc   = quote_plus(user)
passwd_enc = quote_plus(passwd)
MONGO_URI = (
    f"mongodb+srv://{user_enc}:{passwd_enc}@{host}/{dbname}"
    "?retryWrites=true&w=majority&tls=true"
)

# Initialize Mongo client
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client[dbname]

# Point Vertex AI at your service account
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GCP_SA_KEY_PATH")
PROJECT_ID = "edustory-hackathon"
LOCATION   = "us-central1"

# ——— FastAPI setup ———
app = FastAPI()

# Request models
class TextRequest(BaseModel):
    text: str

class ExplainRequest(BaseModel):
    id: str
    mode: str  # "story" or "example"

# Helper to embed text
def get_embedding(text: str):
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = TextEmbeddingModel.from_pretrained("text-embedding-005")
    return model.get_embeddings([text])[0].values

# ——— Endpoints ———

@app.post("/embed")
def embed(req: TextRequest):
    try:
        vec = get_embedding(req.text)
        return {"embedding": vec}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search")
def search(q: str, k: int = 5):
    # 1) embed the query
    vec = get_embedding(q)

    # 2) run vector search
    pipeline = [
        {
            "$search": {
                "index": "EduStory",
                "knn": {
                    "path": "embedding",
                    "vector": vec,
                    "k": k
                }
            }
        },
        { "$project": { "title":1, "text":1, "_id":1 } },
        { "$limit": k }
    ]
    try:
        docs = list(db.concepts.aggregate(pipeline))
        return {"results": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/explain")
def explain(req: ExplainRequest):
    # 1) fetch the snippet
    doc = db.concepts.find_one({"_id": req.id})
    if not doc:
        raise HTTPException(status_code=404, detail="Snippet not found")

    # 2) choose prompt
    prompt = (
        f"Explain the following content as a story:\n\n{doc['text']}"
        if req.mode=="story"
        else f"Give a concrete example for this concept:\n\n{doc['text']}"
    )

    # 3) call Vertex AI chat
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    chat = vertexai.preview.language_models.ChatModel.from_pretrained("chat-bison@001")
    response = chat.predict(prompt)
    return {"explanation": response.text}
