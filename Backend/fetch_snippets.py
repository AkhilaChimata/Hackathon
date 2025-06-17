import json
import requests
import time

# Load topics from cs_topics.json
with open("cs_topics.json", "r", encoding="utf-8") as f:
    topics = json.load(f)

snippets = []

for topic in topics:
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic.replace(' ', '_')}"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            summary = data.get("extract", "No summary found.")
        else:
            summary = "No summary found."
    except Exception as e:
        summary = f"Error fetching summary: {e}"
    snippets.append({
        "title": topic,
        "text": summary
    })
    print(f"Fetched: {topic}")
    time.sleep(0.5)  # Be polite to Wikipedia

# Save to cs_snippets.json
with open("cs_snippets.json", "w", encoding="utf-8") as f:
    json.dump(snippets, f, ensure_ascii=False, indent=2)

print("✅ Wikipedia summaries saved to cs_snippets.json")
