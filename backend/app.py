import os
import json
import uuid
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import werkzeug.utils
from nia_service import robust_extract
from utils.extractor import get_text_from_file

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
FORMS_FILE = os.path.join(DATA_DIR, 'forms.json')
SUBMISSIONS_FILE = os.path.join(DATA_DIR, 'submissions.json')
LOGS_FILE = os.path.join(DATA_DIR, 'logs.json')

# Ensure storage files exist
os.makedirs(DATA_DIR, exist_ok=True)
for f in [FORMS_FILE, SUBMISSIONS_FILE, LOGS_FILE]:
    if not os.path.exists(f):
        with open(f, 'w') as db:
            json.dump([], db)

# Helper functions to handle JSON "database"
def read_db(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)

def write_db(filepath, data):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)

# --- ADMIN & CORE ENDPOINTS ---

@app.route('/api/forms', methods=['POST', 'GET'])
def manage_user_forms():
    if request.method == 'POST':
        form_data = request.json
        form_data['id'] = str(uuid.uuid4())
        forms = read_db(FORMS_FILE)
        forms.append(form_data)
        write_db(FORMS_FILE, forms)
        return jsonify({"message": "Form created successfully", "id": form_data['id']}), 201
    
    return jsonify(read_db(FORMS_FILE)), 200

@app.route('/api/extract', methods=['POST'])
def extract_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    form_id = request.form.get('formId')
    schema_json = request.form.get('schema')

    if not schema_json:
        return jsonify({"error": "No schema provided"}), 400

    # Create a temporary file to store the uploaded file
    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
    try:
        with os.fdopen(fd, 'wb') as tmp:
            file.save(tmp)

        schema = json.loads(schema_json)
        _, extension = os.path.splitext(file.filename)
        
        # Extract real text from the file
        document_text = get_text_from_file(temp_path, extension)
        
        if not document_text.strip():
            return jsonify({"error": "No text could be extracted from the uploaded document."}), 400

        extracted_data = robust_extract(schema, document_text, form_id)
        
        return jsonify({"extractedData": extracted_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Ensure the temporary file is always removed
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/api/admin/metrics', methods=['GET'])
def get_metrics():
    # Simple admin dashboard aggregator
    forms = read_db(FORMS_FILE)
    submissions = read_db(SUBMISSIONS_FILE)
    logs = read_db(LOGS_FILE)
    
    total_extractions = len(logs)
    failed_extractions = sum(1 for log in logs if log.get('status') == 'failed')
    
    return jsonify({
        "totalForms": len(forms),
        "totalSubmissions": len(submissions),
        "extractionSuccessRate": f"{((total_extractions - failed_extractions) / total_extractions * 100) if total_extractions else 100:.1f}%",
        "totalLogs": total_extractions
    }), 200

@app.route('/api/admin/logs', methods=['GET'])
def get_logs():
    return jsonify(read_db(LOGS_FILE)), 200

@app.route('/api/submissions', methods=['POST'])
def create_submission():
    submission_data = request.json
    submissions = read_db(SUBMISSIONS_FILE)
    submission_data['id'] = str(uuid.uuid4())
    submissions.append(submission_data)
    write_db(SUBMISSIONS_FILE, submissions)
    return jsonify({"message": "Submission saved successfully", "id": submission_data['id']}), 201

@app.route('/api/admin/forms/<form_id>', methods=['DELETE'])
def admin_delete_form(form_id):
    forms = read_db(FORMS_FILE)
    updated_forms = [f for f in forms if f.get('id') != form_id]
    if len(forms) == len(updated_forms):
        return jsonify({"error": "Form not found"}), 404
    write_db(FORMS_FILE, updated_forms)
    return jsonify({"message": "Form deleted by admin"}), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)