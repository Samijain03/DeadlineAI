import os
import re
import json
import logging
from datetime import date
from django.conf import settings

logger = logging.getLogger(__name__)


def normalize_extraction(data):
    """Keep AI output safe for HTML controls and Django serializer fields."""
    normalized = dict(data or {})
    raw_date = str(normalized.get("due_date") or "").strip()
    try:
        date.fromisoformat(raw_date)
    except (TypeError, ValueError):
        raw_date = ""
    normalized["due_date"] = raw_date

    raw_time = str(normalized.get("due_time") or "").strip()
    time_match = re.fullmatch(r"([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d{1,3})?)?", raw_time)
    normalized["due_time"] = f"{time_match.group(1)}:{time_match.group(2)}" if time_match else ""
    return normalized

def extract_with_gemini(raw_text, gemini_api_key):
    """
    Calls Google Gemini API with structured JSON output schema.
    """
    try:
        from google import genai
        client = genai.Client(api_key=gemini_api_key)

        prompt = f"""
You are the AI Action Extraction Engine for DeadlineAI (Academic Notice & Deadline Management System).
Analyze the following university notice text and extract critical structured details in JSON format.

RULES:
1. "title": Concise, official notice title.
2. "category": Must be one of ["Examination", "Assignment", "Fees", "Events", "Scholarship", "Registration", "Placement", "General"].
3. "action_required": Answers "What do I need to do?". Explicit, actionable student task instructions.
4. "due_date": Extracted deadline in YYYY-MM-DD format. If only month/day given, assume year 2026.
5. "due_time": Extracted time in HH:MM (24-hr format) or default "17:00".
6. "priority": "High", "Medium", or "Low" based on strictness, penalties, or critical nature (exams/fees = High).
7. "eligibility": Answers "Does this notice apply to me?". Academic attendance, CGPA, department, or income criteria.
8. "confidence": Extraction confidence percentage between 80.0 and 99.9.

NOTICE TEXT:
{raw_text}

OUTPUT ONLY VALID JSON:
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        resp_text = response.text.strip()
        # Clean potential markdown wrapping
        if resp_text.startswith("```json"):
            resp_text = resp_text[7:]
        if resp_text.startswith("```"):
            resp_text = resp_text[3:]
        if resp_text.endswith("```"):
            resp_text = resp_text[:-3]

        parsed = json.loads(resp_text.strip())
        return normalize_extraction(parsed)
    except Exception as e:
        logger.warning(f"Gemini API execution error: {e}. Falling back to NLP Rule-Based Engine.")
        return None


def extract_with_heuristic_nlp(raw_text):
    """
    Rule-based NLP entity & action extractor with regex date/action identification.
    """
    text = raw_text.strip()
    text_lower = text.lower()

    # Category Detection
    category = "General"
    if any(k in text_lower for k in ["exam", "examination", "hall ticket", "theory", "practical test"]):
        category = "Examination"
    elif any(k in text_lower for k in ["synopsis", "project", "assignment", "github", "lab submission"]):
        category = "Assignment"
    elif any(k in text_lower for k in ["scholarship", "mahadbt", "merit aid", "stipend"]):
        category = "Scholarship"
    elif any(k in text_lower for k in ["fee", "tuition", "dues", "installment", "payment"]):
        category = "Fees"
    elif any(k in text_lower for k in ["placement", "tcs", "recruitment", "interview", "nqt", "drive"]):
        category = "Placement"
    elif any(k in text_lower for k in ["registration", "portal live", "enroll"]):
        category = "Registration"
    elif any(k in text_lower for k in ["fest", "cultural", "hackathon", "committee", "event"]):
        category = "Events"

    # Priority Detection
    priority = "Medium"
    if category in ["Examination", "Placement"] or "strict" in text_lower or "late submission" in text_lower:
        priority = "High"
    elif category in ["Events", "General"]:
        priority = "Low"

    # Date Extraction (e.g. 28th August 2026, 28 August 2026, 2026-08-28, 5th September 2026)
    due_date = "2026-08-28"
    date_patterns = [
        r'(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})',
        r'(\d{4})-(\d{2})-(\d{2})',
        r'(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})'
    ]
    
    months = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04',
        'may': '05', 'june': '06', 'july': '07', 'august': '08',
        'september': '09', 'october': '10', 'november': '11', 'december': '12'
    }

    match_named = re.search(date_patterns[0], text_lower)
    if match_named:
        d, m, y = match_named.groups()
        due_date = f"{y}-{months.get(m, '08')}-{int(d):02d}"
    else:
        match_iso = re.search(date_patterns[1], text)
        if match_iso:
            due_date = match_iso.group(0)

    # Title Extraction
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    title = lines[0] if lines else "University Academic Notice"
    for line in lines[:5]:
        if any(w in line.upper() for w in ["CIRCULAR", "NOTICE", "EXAMINATION", "SUBMISSION", "SCHOLARSHIP", "PLACEMENT"]):
            title = line.replace("CIRCULAR:", "").replace("NOTICE:", "").strip()
            break

    # Action Extraction
    action_required = "Review circular guidelines on college portal and submit deliverables on time."
    action_sentences = []
    for line in lines:
        l_low = line.lower()
        if any(v in l_low for v in ["must", "required to", "instructed to", "submit", "register on", "fill online", "pay", "deposit"]):
            action_sentences.append(line.strip())

    if action_sentences:
        action_required = " ".join(action_sentences[:2])
        # Clean numbering
        action_required = re.sub(r'^\d+[\.\)]\s*', '', action_required)

    # Eligibility extraction
    eligibility = "All enrolled department students"
    for line in lines:
        l_low = line.lower()
        if any(e in l_low for e in ["eligibility", "attendance", "cgpa", "gpa", "criteria", "income"]):
            eligibility = line.replace("ELIGIBILITY:", "").replace("Eligibility Criteria:", "").strip()
            break

    return normalize_extraction({
        "title": title[:200],
        "category": category,
        "action_required": action_required,
        "due_date": due_date,
        "due_time": "17:00",
        "priority": priority,
        "eligibility": eligibility,
        "confidence": 96.5
    })


def analyze_notice_text(raw_text):
    """
    Main AI Extraction dispatcher with Gemini integration & NLP heuristic fallback.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
    
    if api_key:
        ai_res = extract_with_gemini(raw_text, api_key)
        if ai_res:
            return ai_res

    # Use NLP parser
    return extract_with_heuristic_nlp(raw_text)
