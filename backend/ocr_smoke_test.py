"""Run inside the deployment image to prove OCR binaries actually work."""
import io
from PIL import Image, ImageDraw, ImageFont
from api.services.ocr_service import process_document_ocr

image = Image.new('RGB', (1200, 220), 'white')
draw = ImageDraw.Draw(image)
draw.text((25, 30), 'Submit assignment by 21 October 2026.', fill='black', font=ImageFont.load_default(size=40))
for kind in ['PNG', 'PDF']:
    stream = io.BytesIO()
    image.save(stream, format=kind)
    stream.seek(0)
    result = process_document_ocr(stream, f'notice.{kind.lower()}')
    assert '2026' in result['text'] and 'assignment' in result['text'].lower(), result
    print(f'{kind} OCR smoke test passed')
