from vertexai.preview.language_models import TextEmbeddingModel
import vertexai

# Replace with your actual Google Cloud project ID and supported region
PROJECT_ID = "edustory-hackathon"
LOCATION = "us-central1"# ✅ This is the supported region for gecko embeddings

def get_embedding(text):
    # Initialize Vertex AI SDK with project and location
    vertexai.init(project=PROJECT_ID, location="us-central1")

    # Load embedding model
    model = TextEmbeddingModel.from_pretrained("textembedding-gecko@001")

    # Get embedding for input text
    embeddings = model.get_embeddings([text])
    return embeddings[0].values  # Returns a list of floats

# Test script
if __name__ == "__main__":
    test_text = "A binary tree is a data structure in which each node has at most two children."
    vector = get_embedding(test_text)
    print("✅ Embedding length:", len(vector))
    print("🔢 First 5 values:", vector[:5])
