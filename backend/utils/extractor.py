import os
import pdfplumber
from PIL import Image
import pytesseract

def extract_text_from_pdf(file_path):
    """Extracts text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")
    return text

def extract_text_from_image(file_path):
    """Extracts text from an image file using OCR."""
    try:
        # pytesseract requires Tesseract-OCR to be installed on the system
        text = pytesseract.image_to_string(Image.open(file_path))
        return text
    except Exception as e:
        raise Exception(f"Error performing OCR on image: {str(e)}")

def get_text_from_file(file_path, extension):
    """Routes the file to the appropriate extraction method based on extension."""
    extension = extension.lower()
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension in ['.png', '.jpg', '.jpeg']:
        return extract_text_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file type: {extension}")
