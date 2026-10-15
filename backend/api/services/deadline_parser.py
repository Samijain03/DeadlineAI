"""Conservative fallback extraction: distinguish issue dates from action deadlines."""
import re
from datetime import date

MONTHS = {name[:3]: index for index, name in enumerate(
    ['january', 'february', 'march', 'april', 'may', 'june', 'july',
     'august', 'september', 'october', 'november', 'december'], 1)}
NAMED = r'\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{4})\b'
PATTERNS = [(NAMED, 'named'), (r'\b(\d{4})-(\d{2})-(\d{2})\b', 'iso'),
            (r'\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b', 'numeric')]


def explicit_time(text):
    values = set()
    for match in re.finditer(r'\b(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b|\b([01]?\d|2[0-3]):([0-5]\d)\b', text, re.I):
        hour, minute, suffix, hour24, minute24 = match.groups()
        if suffix:
            if not 1 <= int(hour) <= 12:
                continue
            value = (int(hour) % 12) + (12 if suffix.lower().startswith('p') else 0)
            values.add(f'{value:02d}:{minute or "00"}')
        else:
            values.add(f'{int(hour24):02d}:{minute24}')
    return next(iter(values)) if len(values) == 1 else ''


def extract_deadline(text):
    candidates = []
    for pattern, kind in PATTERNS:
        for match in re.finditer(pattern, text, re.I):
            try:
                if kind == 'named':
                    day, month, year = match.groups()
                    value = date(int(year), MONTHS[month[:3].lower()], int(day))
                elif kind == 'iso':
                    year, month, day = match.groups()
                    value = date(int(year), int(month), int(day))
                else:
                    day, month, year = match.groups()
                    value = date(int(year), int(month), int(day))
            except (ValueError, KeyError):
                continue
            prefix = text[max(0, match.start() - 80):match.start()].lower()
            # A label on the previous line is common in OCR output.
            prefix = '\n'.join(prefix.splitlines()[-2:])
            deadline_labels = list(re.finditer(r'deadline|due(?:\s+date)?|last\s+date|on\s+or\s+before|no\s+later\s+than|\bby\b|\bbefore\b', prefix))
            issue_labels = list(re.finditer(r'issued?|dated?|published|notice\s+date', prefix))
            last_deadline = deadline_labels[-1].start() if deadline_labels else -1
            last_issue = issue_labels[-1].start() if issue_labels else -1
            score = 2 if last_deadline > last_issue else -2 if last_issue >= 0 else 0
            line_end = text.find('\n', match.end())
            line_end = len(text) if line_end < 0 else line_end
            context = text[max(text.rfind('\n', 0, match.start()) + 1, match.start() - 100):line_end]
            candidates.append((score, value.isoformat(), context))
    if not candidates:
        return '', explicit_time(text)
    best_score = max(item[0] for item in candidates)
    winners = [item for item in candidates if item[0] == best_score]
    if best_score < 0 or len({item[1] for item in winners}) != 1:
        return '', ''
    due_date = winners[0][1]
    # Prefer a time on the deadline line; only use a unique time elsewhere.
    due_time = explicit_time(' '.join(item[2] for item in winners)) or explicit_time(text)
    return due_date, due_time
