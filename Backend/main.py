# main.py

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi
from urllib.parse import quote_plus
from bson import ObjectId, errors as bson_errors
import vertexai
from vertexai.generative_models import GenerativeModel

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

class ExplainRequest(BaseModel):
    id: str
    mode: str  # "story" or "example"

@app.get("/search")
def search(q: str, k: int = 5):
    try:
        pipeline = [
            {
                "$search": {
                    "index": "EduStory",
                    "text": {
                        "query": q,
                        "path": ["title", "text"]
                    }
                }
            },
            {"$project": {"title": 1, "text": 1, "_id": 1}},
            {"$limit": k}
        ]
        docs = list(db.concepts.aggregate(pipeline))
        # Convert ObjectId to string
        for doc in docs:
            doc["_id"] = str(doc["_id"])
        return {"results": docs}
    except Exception as e:
        print("SEARCH ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

# Vertex AI setup (reuse from embed_text_vertexai.py)
PROJECT_ID = "edustory-hackathon"
LOCATION = "us-central1"
GCP_SA_KEY_PATH = os.getenv("GCP_SA_KEY_PATH")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_SA_KEY_PATH

def generate_explanation_llm(title, text, mode):
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = GenerativeModel("gemini-2.0-flash-001")  # or "gemini-2.0-flash-lite-001"
    if mode == "story":
        prompt = (
            f"Explain the following computer science concept as a story for a beginner:\n\n"
            f"Title: {title}\n"
            f"Description: {text}\n"
        )
    else:
        prompt = (
            f"Give a simple, concrete example for the following computer science concept:\n\n"
            f"Title: {title}\n"
            f"Description: {text}\n"
        )
    response = model.generate_content(prompt)
    return response.text.strip()

@app.post("/explain")
async def explain(req: ExplainRequest):
    try:
        oid = ObjectId(req.id)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid snippet ID")
    doc = db.concepts.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Snippet not found")

    title = doc.get("title", "")
    text = doc.get("text", "")

    try:
        explanation = generate_explanation_llm(title, text, req.mode)
    except Exception as e:
        print("LLM ERROR:", e)
        raise HTTPException(status_code=500, detail="LLM generation failed")

    return {"explanation": explanation}
