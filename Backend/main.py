# main.py

from fastapi import FastAPI, HTTPException, Request, Body
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
from vertexai.preview.generative_models import GenerativeModel as PreviewGenerativeModel
import requests
import google.auth
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2 import service_account
import time
from fastapi.responses import StreamingResponse, JSONResponse
import base64
from io import BytesIO
from gcs_utils import upload_video_to_gcs
import sys

# Only load .env locally
if os.getenv("RENDER") != "true":
    load_dotenv()

# Sanity check for required env vars
for var in ("MONGO_USER", "MONGO_PASS", "MONGO_HOST", "GCP_SA_KEY_PATH"):
    if not os.getenv(var):
        print(f"Missing env var: {var}", file=sys.stderr)
        sys.exit(1)

dbname = "ai_tutor"
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    user   = os.getenv("MONGO_USER")
    passwd = os.getenv("MONGO_PASS")
    host   = os.getenv("MONGO_HOST")
    user_enc   = quote_plus(str(user))
    passwd_enc = quote_plus(str(passwd))
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

class VideoRequest(BaseModel):
    story: str

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

@app.post("/gemini-veo-video")
async def gemini_veo_video(req: VideoRequest = Body(...)):
    # Get service account credentials and access token
    SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]
    credentials = service_account.Credentials.from_service_account_file(GCP_SA_KEY_PATH, scopes=SCOPES)
    credentials.refresh(GoogleAuthRequest())
    access_token = credentials.token

    # Prepare request to Veo API
    model_id = "veo-2.0-generate-001"
    endpoint = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/{model_id}:predictLongRunning"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=utf-8"
    }
    request_body = {
        "instances": [
            {"prompt": req.story}
        ],
        "parameters": {
            "duration": 6,  # 5-8 seconds
            "aspectRatio": "16:9",
            "sampleCount": 1
        }
    }
    # Start video generation
    resp = requests.post(endpoint, headers=headers, json=request_body)
    if not resp.ok:
        print("Veo API error (predictLongRunning):", resp.text)
        raise HTTPException(status_code=500, detail=f"Veo API error: {resp.text}")
    operation_name = resp.json().get("name")
    if not operation_name:
        raise HTTPException(status_code=500, detail="No operation name returned from Veo API.")

    # Poll for completion (up to 5 minutes)
    poll_endpoint = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/{model_id}:fetchPredictOperation"
    poll_body = {"operationName": operation_name}
    video_uri = None
    video_bytes = None
    for i in range(150):  # Poll up to 5 minutes (150 * 2s = 300s)
        poll_resp = requests.post(poll_endpoint, headers=headers, json=poll_body)
        if not poll_resp.ok:
            print("Veo API error (fetchPredictOperation):", poll_resp.text)
            raise HTTPException(status_code=500, detail=f"Veo API error: {poll_resp.text}")
        poll_data = poll_resp.json()
        # Write the entire poll_data to a file for debugging
        try:
            with open(os.path.join(os.path.dirname(__file__), "response.txt"), "w", encoding="utf-8") as resp_file:
                import json
                resp_file.write(json.dumps(poll_data, indent=2))
        except Exception as resp_err:
            print(f"[ERROR] Failed to write response.txt: {resp_err}")
        print(f"[Veo Poll Attempt {i+1}] Response: {poll_data}")  # Log for debugging
        if poll_data.get("done"):
            samples = poll_data.get("response", {}).get("generatedSamples", [])
            if samples:
                # Prefer GCS URI if available
                if "video" in samples[0] and "uri" in samples[0]["video"]:
                    video_uri = samples[0]["video"]["uri"]
                # If base64 blob is present, decode it
                elif "video" in samples[0] and ("bytes" in samples[0]["video"] or "data" in samples[0]["video"]):
                    base64_blob = samples[0]["video"].get("bytes") or samples[0]["video"].get("data")
                    video_bytes = base64.b64decode(base64_blob)
            break
        time.sleep(2)

    # If a GCS URI is available, return it directly
    if video_uri:
        return {"videoUrl": video_uri}

    # If video bytes are available, either upload to GCS or stream
    if video_bytes:
        # Save to file for manual use
        output_path = os.path.join(os.path.dirname(__file__), "output.mp4")
        try:
            with open(output_path, "wb") as f:
                f.write(video_bytes)
            print(f"[INFO] Video written to {output_path} ({len(video_bytes)} bytes)")
        except Exception as file_err:
            print(f"[ERROR] Failed to write video file: {file_err}")
        UPLOAD_TO_GCS = os.getenv("UPLOAD_TO_GCS", "False").lower() == "true"
        GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
        if UPLOAD_TO_GCS and GCS_BUCKET_NAME:
            filename = f"veo_video_{int(time.time())}.mp4"
            try:
                public_url = upload_video_to_gcs(video_bytes, filename, GCS_BUCKET_NAME)
                return {"videoUrl": public_url}
            except Exception as e:
                print("GCS upload error:", e)
                raise HTTPException(status_code=500, detail="Failed to upload video to GCS.")
        video_stream = BytesIO(video_bytes)
        return StreamingResponse(
            video_stream,
            media_type="video/mp4",
            headers={"Content-Disposition": "inline; filename=story_video.mp4"}
        )

    raise HTTPException(status_code=500, detail="Video generation timed out or failed. See backend logs for details.")
