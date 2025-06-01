import requests
import time
import json

CATEGORY = "Top-importance_Computer_science_articles"
LIMIT   = 500  # max number of titles to fetch
SLEEP   = 0.1  # polite pause between API calls

def get_category_members(category, limit=500):
    S = requests.Session()
    url = "https://en.wikipedia.org/w/api.php"
    titles = []
    params = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "cmtitle": f"Category:{category}",   # no leading hyphen here!
        "cmlimit": 50,                       # fetch 50 at a time
        "cmnamespace": 0       
     }


    while True:
        resp = S.get(url, params=params).json()
        members = resp["query"]["categorymembers"]
        # collect titles
        for page in members:
            titles.append(page["title"])
            if len(titles) >= limit:
                return titles[:limit]

        # continue if there’s more
        if "continue" in resp:
            params.update(resp["continue"])
            time.sleep(SLEEP)
        else:
            break

    return titles

if __name__ == "__main__":
    cs_topics = get_category_members(CATEGORY, LIMIT)
    print(f"Fetched {len(cs_topics)} topics.")
    # Save to JSON
    with open("cs_topics.json", "w", encoding="utf-8") as f:
        json.dump(cs_topics, f, indent=2, ensure_ascii=False)
    print("Saved to cs_topics.json")
