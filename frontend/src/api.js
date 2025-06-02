import axios from "axios";

// Because we set "proxy" in package.json to http://localhost:8000,
// any request from React to "/search" or "/explain" goes to your Python backend.
const apiClient = axios.create({
  baseURL: "",
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