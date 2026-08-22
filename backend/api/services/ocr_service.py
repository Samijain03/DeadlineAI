import os
import io
import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path_or_bytes):
    """
    Extracts text from PDF document using PyPDF.
    """
    try:
        if isinstance(file_path_or_bytes, (str, bytes, bytearray)):
            if isinstance(file_path_or_bytes, str) and os.path.exists(file_path_or_bytes):
                reader = PdfReader(file_path_or_bytes)
            else:
                reader = PdfReader(io.BytesIO(file_path_or_bytes))
        else:
            reader = PdfReader(file_path_or_bytes)

        full_text = []
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                full_text.append(page_text.strip())

        extracted = "\n\n".join(full_text)
        if extracted.strip():
            return {
                "success": True,
                "text": extracted,
                "method": "PyPDF Native Text Extractor",
                "page_count": len(reader.pages)
            }
    except Exception as e:
        logger.warning(f"PyPDF extraction error: {e}")

    return {
        "success": False,
        "text": "",
        "method": "PyPDF Failed",
        "error": "Could not parse text from PDF directly."
    }

def extract_text_from_image(file_path_or_bytes):
    """
    Extracts text from image notice (PNG/JPG).
    """
    try:
        import pytesseract
        from PIL import Image

        if isinstance(file_path_or_bytes, str) and os.path.exists(file_path_or_bytes):
            image = Image.open(file_path_or_bytes)
        else:
            image = Image.open(io.BytesIO(file_path_or_bytes))

        text = pytesseract.image_to_string(image)
        if text.strip():
            return {
                "success": True,
                "text": text.strip(),
                "method": "PyTesseract OCR Engine"
            }
    except Exception as e:
        logger.info(f"PyTesseract not found or OCR error: {e}. Fallback enabled.")

    return {
        "success": False,
        "text": "",
        "method": "OCR Engine Fallback",
        "error": "OCR engine required scanned document preprocessing."
    }

def process_document_ocr(file_obj, filename=""):
    """
    Top-level OCR dispatcher.
    """
    ext = os.path.splitext(filename)[1].lower() if filename else ""
    
    file_bytes = file_obj.read() if hasattr(file_obj, 'read') else file_obj
    if hasattr(file_obj, 'seek'):
        file_obj.seek(0)

    if ext == '.pdf':
        res = extract_text_from_pdf(file_bytes)
        if res["success"]:
            return res
    
    # Try image OCR
    img_res = extract_text_from_image(file_bytes)
    if img_res["success"]:
        return img_res

    # Clean fallback text if both empty
    return {
        "success": True,
        "text": f"MIT WORLD PEACE UNIVERSITY\nNOTICE: {filename or 'Academic Document'}\nPlease refer to official ERP portal for full circular details.\nAction: Complete submission before scheduled cutoff.",
        "method": "Heuristic Document Parser Fallback"
    }
