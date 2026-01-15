#!/usr/bin/env python3
"""
Utility script to upload the local *.txt context files to Backboard as memories
for a given client, using the existing /client/upload-content endpoint.

This is intentionally simple so you can just run it once per environment.

Usage (from repo root):

  python scripts/upload_text_memories.py --client-id ALEX \
      --backend-url https://rob-production.up.railway.app

It will look for:
  - drive.txt
  - git.txt
  - telegram.txt

and upload each as a separate "document" into the assistant's knowledge base.
"""

import argparse
import os
import sys
from typing import List, Tuple

import requests


DEFAULT_FILES: List[Tuple[str, str]] = [
    ("drive.txt", "Drive Context Export"),
    ("git.txt", "Git Context Export"),
    ("telegram.txt", "Telegram Chat Export"),
]


def upload_file(backend_url: str, client_id: str, path: str, title: str) -> None:
    """Upload a single text file via /client/upload-content."""
    if not os.path.exists(path):
        print(f"[skip] {path} not found")
        return

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.strip():
        print(f"[skip] {path} is empty")
        return

    url = f"{backend_url.rstrip('/')}/client/upload-content"
    params = {
        "client_id": client_id,
        "title": title,
    }

    print(f"[upload] {path} → {url} (client_id={client_id}, title={title!r})")
    resp = requests.post(url, params=params, data=content.encode("utf-8"), timeout=60)
    try:
        body = resp.json()
    except Exception:
        body = resp.text

    if resp.status_code == 200:
        print(f"[ok] {path}: {body}")
    else:
        print(f"[error] {path}: HTTP {resp.status_code} {body}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Upload local *.txt context files to Backboard via /client/upload-content"
    )
    parser.add_argument(
        "--backend-url",
        required=False,
        default=os.getenv("BACKEND_URL", "http://localhost:8000"),
        help="Backend base URL (default: BACKEND_URL env or http://localhost:8000)",
    )
    parser.add_argument(
        "--client-id",
        required=True,
        help="Client ID whose assistant should receive the memories (e.g. ALEX)",
    )

    args = parser.parse_args()
    backend_url: str = args.backend_url
    client_id: str = args.client_id

    print(f"Backend URL: {backend_url}")
    print(f"Client ID  : {client_id}")

    for filename, title in DEFAULT_FILES:
        upload_file(backend_url, client_id, filename, title)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())


