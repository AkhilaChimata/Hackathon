import axios from "axios";

// Instead of
// const API_URL = "http://localhost:8000";
// Use your backend's public URL, e.g.:
const API_URL = "https://your-backend-service.onrender.com";

// Because we set "proxy" in package.json to http://localhost:8000,
// any request from React to "/search" or "/explain" goes to your Python backend.
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// GET /search?q=<query>
export function searchConcepts(query) {
    return apiClient.get(`/search?q=${encodeURIComponent(query)}`);
}

// POST /explain with { text, mode }
export function explainText(text, mode) {
  return apiClient.post("/explain", { text, mode });
}

// POST /gemini-veo-video with { story }
export async function generateStoryVideo(story) {
  try {
    // Try as JSON first
    const response = await apiClient.post("/gemini-veo-video", { story });
    // If response is JSON with videoUrl, return as is
    if (response.data && response.data.videoUrl) {
      return { type: "url", url: response.data.videoUrl };
    }
    // Fallback: treat as blob (should not happen here)
    return { type: "unknown" };
  } catch (err) {
    // If error is a binary response (video stream), handle as blob
    if (err.response && err.response.status === 200 && err.response.data instanceof Blob) {
      const videoBlob = err.response.data;
      const videoUrl = URL.createObjectURL(videoBlob);
      return { type: "blob", url: videoUrl };
    }
    // If error is not a blob, rethrow
    throw err;
  }
}