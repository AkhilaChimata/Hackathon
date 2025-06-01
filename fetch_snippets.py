import requests, json, time

with open("cs_topics.json", "r", encoding="utf-8") as f:
    titles = json.load(f)

# Drop any with colons, just in case
titles = [t for t in titles if ":" not in t]

print(f"DEBUG: Will attempt to fetch intros for these titles:\n{titles}\n")

API_URL = "https://en.wikipedia.org/w/api.php"
snippets = []

for title in titles:
    print(f"\n--- FETCHING: {title} ---")
    params = {
        "action": "query",
        "format": "json",
        "prop": "extracts",
        "exintro": True,
        "explaintext": True,
        "titles": title,
    }
    resp = requests.get(API_URL, params=params).json()
    # Print top‐level keys and page dict
    print("API response keys:", resp.keys())
    page = next(iter(resp.get("query", {}).get("pages", {}).values()), {})
    print("PAGE keys:", page.keys())

    text = page.get("extract", "").strip()
    if not text:
        print(f"⚠️ No extract (or empty) for: '{title}'")
    else:
        snippets.append({"title": title, "text": text, "tags": ["wikipedia", "computer-science"]})

    time.sleep(0.1)

print(f"\nSummary: fetched {len(snippets)} snippets.")
