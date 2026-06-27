import time
import json
import os
import requests

LOGS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'logs.json')

def load_env_var(var_name):
    """Helper to load environment variables from .env file."""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        return None
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith(var_name):
                return line.strip().split('=')[1]
    return None

NIA_API_KEY = load_env_var('NIA_API_KEY')
NIA_API_URL = "https://apigcp.trynia.ai/v2/search"

def call_nia_api(form_schema, document_text):
    """Calls the Nia Search API to perform schema-driven extraction."""
    if not NIA_API_KEY:
        raise Exception("NIA_API_KEY is not configured in the backend .env file.")

    # Construct a prompt that guides the AI to extract data based on the schema
    # and return it in a very specific JSON format.
    prompt = (
        "You are an expert document analysis agent. Your task is to extract information from the provided text "
        "to populate a specific form schema. \n\n"
        "### DOCUMENT TEXT:\n"
        f"{document_text}\n\n"
        "### FORM SCHEMA:\n"
        f"{json.dumps(form_schema, indent=2)}\n\n"
        "### INSTRUCTIONS:\n"
        "1. For each field in the form schema, look for the corresponding information in the document text.\n"
        "2. Return the extracted data as a JSON object where the keys are the field 'id's from the schema.\n"
        "3. Each value in the JSON object must be another object with two keys:\n"
        "   - 'text': The extracted value as a string. If no value is found, use an empty string.\n"
        "   - 'confidence': A float between 0.0 and 1.0 representing your certainty in the extraction.\n"
        "4. If a value is not found, use an empty string for 'text' and 0.0 for 'confidence'.\n"
        "5. Respond ONLY with the JSON object. Do not include any preamble, explanation, or markdown formatting like ```json ... ```.\n"
    )

    headers = {
        "Authorization": f"Bearer {NIA_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "mode": "query",
        "messages": [{"role": "user", "content": prompt}]
    }

    response = requests.post(NIA_API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"Nia API error ({response.status_code}): {response.text}")

    result = response.json()

    # The Nia Search API typically returns a response containing an answer or a list of messages.
    # We need to extract the text content from the response.
    # Based on common patterns for these types of APIs, we'll try to find the answer.
    try:
        # Attempt to get the content from the first message in the response
        # Note: This part might need adjustment depending on the exact response structure of Nia API
        answer_text = result.get('answer') or result.get('choices', [{}])[0].get('message', {}).get('content')

        if not answer_text:
            raise Exception("API response did not contain an answer content.")

        # Parse the AI's string response into a JSON object
        return json.loads(answer_text.strip())
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        raise Exception(f"Failed to parse AI response as JSON: {str(e)}. Raw response: {answer_text if 'answer_text' in locals() else 'N/A'}")

def log_extraction_event(form_id, status, error_msg=None, performance_ms=0):
    with open(LOGS_FILE, 'r') as f:
        logs = json.load(f)
    logs.append({
        "id": str(time.time()),
        "formId": form_id,
        "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
        "status": status,
        "error": error_msg,
        "durationMs": performance_ms
    })
    with open(LOGS_FILE, 'w') as f:
        json.dump(logs, f, indent=4)

def robust_extract(form_schema, document_text, form_id="unknown"):
    start_time = time.time()
    extracted_data = {}

    try:
        # --- Call the Nia API ---
        raw_nia_output = call_nia_api(form_schema, document_text)

        # Enhanced Layer: Handle missing variables, low confidence indicators, and structural edge cases
        for field in form_schema.get('fields', []):
            field_id = field.get('id')
            field_label = field.get('label', '').lower()

            # 1. Look for direct match or resolve fuzzy schema naming mismatches
            matched_value = raw_nia_output.get(field_id) or raw_nia_output.get(field_label)

            if matched_value:
                # 2. Check model field confidence parameter metadata
                confidence = matched_value.get('confidence', 1.0)
                extracted_data[field_id] = {
                    "value": matched_value.get('text', ''),
                    "lowConfidence": confidence < 0.70  # Flag soft errors to UI
                }
            else:
                # 3. Prevent controlled component runtime breakdowns by sending explicitly blank states
                extracted_data[field_id] = {"value": "", "lowConfidence": False}

        duration = int((time.time() - start_time) * 1000)
        log_extraction_event(form_id, "success", performance_ms=duration)
        return extracted_data

    except Exception as e:
        duration = int((time.time() - start_time) * 1000)
        log_extraction_event(form_id, "failed", error_msg=str(e), performance_ms=duration)
        raise e