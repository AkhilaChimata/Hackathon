import requests

API_URL = "https://en.wikipedia.org/w/api.php"
title = "Algorithm"  # pick one you know exists exactly

params = {
    "action": "query",
    "format": "json",
    "prop": "extracts",
    "exintro": True,
    "explaintext": True,
    "titles": title,
}

resp = requests.get(API_URL, params=params).json()
print("FULL API RESPONSE:", resp)  # See exactly what’s returned

page = next(iter(resp["query"]["pages"].values()))
print("PAGE DICT:", page)           # Inspect page data

print("Extract text:", page.get("extract"))
