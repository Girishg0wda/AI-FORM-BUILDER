from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import os
import re

print("APP LOADED SUCCESSFULLY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ExtractRequest(BaseModel):
    form_schema: list
    text: str


def extract_pdf_text(file_path):
    text = ""

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

    except Exception as e:
        print("PDF ERROR:", e)

    return text


@app.get("/")
def home():
    return {
        "message": "Backend Running"
    }


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    allowed = [
        "application/pdf",
        "image/png",
        "image/jpeg"
    ]

    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF, PNG, JPG, JPEG allowed."
        )

    filepath = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(filepath, "wb") as f:
        f.write(await file.read())

    extracted_text = ""

    if file.content_type == "application/pdf":
        extracted_text = extract_pdf_text(filepath)

    return {
        "message": "Uploaded Successfully",
        "filename": file.filename,
        "text": extracted_text
    }


@app.post("/extract")
async def extract_data(data: ExtractRequest):

    text = data.text
    lines = text.split("\n")

    result = {}

    # NAME
    name = ""

    if len(lines) > 0:
        name = lines[0].strip()

    # EMAIL
    email_match = re.search(
        r'[\w\.-]+@[\w\.-]+\.\w+',
        text
    )

    email = (
        email_match.group(0)
        if email_match
        else ""
    )

    # PHONE

    phone_match = re.search(
        r'(\+91[-\s]?\d{10}|\d{10})',
        text
    )

    phone = (
        phone_match.group(0)
        if phone_match
        else ""
    )

    # SKILLS
    skill_keywords = [
        "Python",
        "Java",
        "JavaScript",
        "HTML",
        "CSS",
        "SQL",
        "React",
        "React.js",
        "Node.js",
        "Express",
        "Express.js",
        "MongoDB",
        "PostgreSQL",
        "SQLite",
        "FastAPI",
        "Django",
        "TensorFlow",
        "Scikit-learn",
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Git",
        "GitHub",
        "Power BI",
        "Bootstrap",
        "Spring Boot",
        "JDBC",
        "Machine Learning",
        "Data Analysis",
        "BeautifulSoup"
    ]

    found_skills = []

    for skill in skill_keywords:

        if skill.lower() in text.lower():
            found_skills.append(skill)

    found_skills = list(
        dict.fromkeys(found_skills)
    )

    skills = ", ".join(found_skills)

    # EXPERIENCE

    experience_lines = []

    keywords = [
        "intern",
        "internship",
        "developer",
        "engineer",
        "analyst"
    ]

    for line in lines:

        lower = line.lower()

        if any(
            word in lower
            for word in keywords
        ):

            cleaned = line.strip()

            if len(cleaned) > 5:
                experience_lines.append(
                    cleaned
                )

    experience = ", ".join(
        list(dict.fromkeys(experience_lines[:5]))
    )

    # DYNAMIC FIELD MAPPING

    for field in data.form_schema:

        label = field.get(
            "label",
            ""
        ).lower()

        original_label = field.get(
            "label",
            ""
        )

        if any(
            x in label
            for x in [
                "name",
                "candidate",
                "full name"
            ]
        ):
            result[original_label] = name

        elif any(
            x in label
            for x in [
                "email",
                "mail"
            ]
        ):
            result[original_label] = email

        elif any(
            x in label
            for x in [
                "phone",
                "mobile",
                "contact"
            ]
        ):
            result[original_label] = phone

        elif "skill" in label:
            result[original_label] = skills

        elif any(
            x in label
            for x in [
                "experience",
                "internship"
            ]
        ):
            result[original_label] = experience

        else:
            result[original_label] = ""

    return result