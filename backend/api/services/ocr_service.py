"""Bounded text extraction; never substitute invented notice text."""
import io
from PIL import Image, ImageOps
from pypdf import PdfReader

MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_PAGES = 5


def image_text(image):
    import pytesseract
    if image.width * image.height > 25_000_000:
        raise ValueError('Use an image below 25 megapixels.')
    image = ImageOps.exif_transpose(image).convert('RGB')
    image.thumbnail((2200, 2200))
    return pytesseract.image_to_string(image, timeout=2).strip()


def process_document_ocr(file_obj, filename=''):
    data = file_obj.read(MAX_FILE_BYTES + 1)
    file_obj.seek(0)
    if not data or len(data) > MAX_FILE_BYTES:
        raise ValueError('Choose a non-empty file of up to 10 MB.')
    extension = filename.lower().rsplit('.', 1)[-1]
    if extension not in {'pdf', 'jpg', 'jpeg', 'png'}:
        raise ValueError('Choose a PDF, JPG or PNG file.')
    parts = []
    used_ocr = False
    try:
        if extension == 'pdf':
            reader = PdfReader(io.BytesIO(data))
            if reader.is_encrypted:
                raise ValueError('Remove the PDF password before uploading.')
            if len(reader.pages) > MAX_PAGES:
                raise ValueError('Upload at most 5 pages at a time.')
            scanned = None
            try:
                for index, page in enumerate(reader.pages):
                    text = (page.extract_text() or '').strip()
                    if not text:
                        import pypdfium2
                        if scanned is None:
                            scanned = pypdfium2.PdfDocument(data)
                        rendered = scanned[index]
                        width, height = rendered.get_size()
                        bitmap = rendered.render(scale=min(1.5, 2200 / max(width, height)))
                        try:
                            text = image_text(bitmap.to_pil())
                        finally:
                            bitmap.close()
                            rendered.close()
                        used_ocr = True
                    parts.append(text)
            finally:
                if scanned is not None:
                    scanned.close()
        else:
            with Image.open(io.BytesIO(data)) as image:
                parts.append(image_text(image))
            used_ocr = True
    except (ValueError, ImportError):
        raise
    except Exception as exc:
        raise ValueError('This document could not be read. Try a clearer file or enter its details manually.') from exc
    text = '\n\n'.join(parts).strip()
    if not text:
        raise ValueError('No readable text was found. Try a clearer file or enter details manually.')
    return {'success': True, 'text': text[:50000], 'method': 'Tesseract OCR' if used_ocr else 'PDF text extraction'}
