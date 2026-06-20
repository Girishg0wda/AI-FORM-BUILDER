import requests
import json
import os

NIA_API_KEY = os.getenv("NIA_API_KEY")

def extract_form_data(form_schema, document_text):

    prompt = f"""
You are an AI document extraction engine.

Form Schema:
{json.dumps(form_schema, indent=2)}

Document:
{document_text}

Instructions:

1. Extract values ONLY for fields in the schema.
2. Return ONLY valid JSON.
3. Use exact field labels.
4. If value cannot be found return null.
5. Do not guess.
6. Low confidence = null.

Example:

{{
  "name": "John Doe",
  "email": "john@gmail.com",
  "skills": "Python, SQL"
}}
"""

    response = requests.post(
        "https://nia.naslabs.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {NIA_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "nia-a-1.0",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert information extraction engine."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0
        },
        timeout=60
    )

    response.raise_for_status()

    result = response.json()

    content = (
        result["choices"][0]
        ["message"]
        ["content"]
    )

    return json.loads(content)