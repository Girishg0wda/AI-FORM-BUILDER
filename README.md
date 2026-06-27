# AI-Powered Form Builder & Document Autofill

This application allows users to design dynamic forms from scratch and automatically populate them using AI-driven data extraction from uploaded documents (PDF, PNG, JPG, JPEG).

## 🚀 Features

- **Dynamic Form Builder**: Create forms at runtime with various field types (Single-line text, Multi-line text, Number, Date, Dropdown, Checkbox).
- **Live Preview**: See the form update in real-time as you configure fields.
- **AI Document Extraction**: Upload a document, and the system uses the Nia AI engine to extract relevant information based on the form's schema.
- **Review & Edit**: Manually review AI-extracted data, identify low-confidence entries, and ensure required fields are filled before final submission.
- **Admin Dashboard**: Track extraction success rates and manage form templates.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (used in `FillPage`), JavaScript.
- **Backend**: Python (Flask), Nia AI API for intelligent extraction.
- **Document Processing**: `pdfplumber` for PDFs, `pytesseract` (Tesseract OCR) for images.
- **Storage**: JSON-based local storage for forms and submissions.

## 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Tesseract OCR (required for image extraction)
  - **Windows**: Install via [tesseract-ocr-w64-setup](https://github.com/UB-Mannheim/tesseract/wiki).
  - **Linux**: `sudo apt-get install tesseract-ocr`
  - **macOS**: `brew install tesseract`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows
   .venv\Scripts\activate
   # Linux/macOS
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the API key in `.env`:
   ```env
   NIA_API_KEY=your_nia_api_key_here
   ```
5. Start the server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 AI Extraction Logic
The system uses a **schema-driven extraction** approach. Instead of searching for fixed fields, the backend sends the entire user-defined form schema and the document text to the Nia AI engine. The AI is instructed to map the document content specifically to the `id`s and `label`s defined in the schema, returning a structured JSON response with values and confidence scores.

## ⚖️ Assumptions & Trade-offs
- **OCR Dependency**: Image extraction relies on Tesseract OCR, which requires a system-level installation.
- **JSON Storage**: For simplicity in this prototype, data is stored in local JSON files rather than a relational database.
- **API Reliance**: The core extraction capability depends on the availability and performance of the Nia AI API.
