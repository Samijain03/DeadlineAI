"""Bounded RFC 822 email parsing; never render HTML or fetch remote resources."""
import hashlib
import re
from email import policy
from email.parser import BytesParser
from html.parser import HTMLParser
from pathlib import PurePath
from .ocr_service import MAX_FILE_BYTES


class PlainHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in {'script', 'style', 'head'}:
            self.hidden += 1
        if tag in {'br', 'p', 'div', 'li', 'tr'}:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in {'script', 'style', 'head'}:
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def parse_email(upload):
    raw = upload.read(MAX_FILE_BYTES + 1)
    if not raw or len(raw) > MAX_FILE_BYTES:
        raise ValueError('Choose an email file of up to 10 MB.')
    if not str(upload.name).lower().endswith('.eml'):
        raise ValueError('Save the original email as an .eml file, then upload it here.')
    try:
        message = BytesParser(policy=policy.default).parsebytes(raw)
        if not any(message.get(header) for header in ['Subject', 'From', 'Date', 'Message-ID']):
            raise ValueError('This file does not appear to contain an email.')
        attachments = []
        for index, part in enumerate(message.walk()):
            if index >= 100:
                raise ValueError('This email contains too many nested parts.')
            if not part.is_multipart() and (part.get_filename() or part.get_content_disposition() == 'attachment'):
                if len(attachments) >= 20:
                    raise ValueError('Use an email with at most 20 attachments.')
                name = str(part.get_filename() or f'attachment-{len(attachments) + 1}')
                # Mail filenames are untrusted and may use either path separator.
                name = re.sub(r'[\x00-\x1f\x7f]', '_', PurePath(name.replace('\\', '/')).name)[:255]
                data = part.get_payload(decode=True) or b''
                attachments.append({'index': len(attachments), 'filename': name,
                    'size': len(data), 'supported': name.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')),
                    'data': data})
        body_part = message.get_body(preferencelist=('plain', 'html'))
        body = body_part.get_content() if body_part else ''
        if body_part and body_part.get_content_type() == 'text/html':
            parser = PlainHTML()
            parser.feed(body)
            body = ''.join(parser.parts)
        body = str(body).strip()[:50000]
        return {'raw': raw, 'fingerprint': hashlib.sha256(raw).hexdigest(),
                'filename': re.sub(r'[\x00-\x1f\x7f]', '_', PurePath(str(upload.name).replace('\\', '/')).name)[:255],
                'subject': str(message.get('Subject', 'Untitled email'))[:255],
                'sender': str(message.get('From', ''))[:500], 'date': str(message.get('Date', ''))[:200],
                'body': body, 'attachments': attachments}
    except ValueError:
        raise
    except (LookupError, UnicodeError, TypeError, RecursionError) as exc:
        raise ValueError('This email could not be decoded. Save it again as an .eml file.') from exc
