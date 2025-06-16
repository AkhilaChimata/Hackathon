# Utility for uploading video bytes to GCS and returning a public URL
import os
from google.cloud import storage

def upload_video_to_gcs(video_bytes: bytes, filename: str, bucket_name: str) -> str:
    """
    Uploads video bytes to the specified GCS bucket and returns the public URL.
    The bucket must have public read access for this to work.
    """
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob.upload_from_string(video_bytes, content_type="video/mp4")
    # Make the blob public
    blob.make_public()
    return blob.public_url
