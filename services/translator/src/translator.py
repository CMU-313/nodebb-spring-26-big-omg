import json
import os
import re
from urllib import error
from urllib import request


OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:7b-instruct")
OLLAMA_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", "30"))

PROMPT_TEMPLATE = """You are a translation service for a web forum.

You will receive forum post BODY text only.

Determine whether the body text is already in English. If it is not in English,
translate the body text into natural English.

Return JSON only with this exact schema:
{{"is_english": true, "translated_content": "original or translated text"}}

Rules:
- Return valid JSON only.
- Use true or false for is_english.
- If the text is already English, translated_content must be the original body text unchanged.
- If the text is not in English, translated_content must be written in English.
- Never repeat non-English input unchanged in translated_content unless the input is already English.
- Translate the entire body, not just the first line.
- Do not return the post title by itself.
- Do not include markdown, code fences, or explanations.

Body text:
<<<
{content}
>>>
"""

RETRY_PROMPT_TEMPLATE = """Translate the following forum post body into English.

Return JSON only with this exact schema:
{{"is_english": false, "translated_content": "English translation"}}

Rules:
- The input is not English.
- translated_content must be English text.
- Do not repeat the original non-English text.
- Do not include markdown, notes, or explanations.
- Translate the full body.

Body text:
<<<
{content}
>>>
"""


def _extract_json_object(raw_response: str) -> dict | None:
    try:
        parsed = json.loads(raw_response)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", raw_response, re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None

    return parsed if isinstance(parsed, dict) else None


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()).casefold()


def _strip_leading_title(content: str, title: str) -> str:
    if not content.strip() or not title.strip():
        return content

    lines = content.splitlines()
    if not lines:
        return content

    first_line = lines[0].strip()
    if _normalize_text(first_line) != _normalize_text(title):
        return content

    remaining = "\n".join(lines[1:]).strip()
    return remaining or content


def _looks_like_bad_translation(content: str, translated_content: str, title: str) -> bool:
    translated = translated_content.strip()
    if not translated:
        return True

    if title.strip() and _normalize_text(translated) == _normalize_text(title):
        return True

    if _normalize_text(translated) == _normalize_text(content):
        non_ascii_in_input = any(ord(char) > 127 for char in content)
        ascii_letters_in_output = sum(char.isascii() and char.isalpha() for char in translated)
        if non_ascii_in_input and ascii_letters_in_output < 5:
            return True

    if len(content.strip()) >= 20 and len(translated) < max(8, len(content.strip()) // 4):
        return True

    return False


def _query_ollama(content: str, force_translate: bool = False) -> str | None:
    prompt_template = RETRY_PROMPT_TEMPLATE if force_translate else PROMPT_TEMPLATE
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt_template.format(content=content),
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }
    body = json.dumps(payload).encode("utf-8")
    ollama_request = request.Request(
        f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(ollama_request, timeout=OLLAMA_TIMEOUT_SECONDS) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except (error.URLError, TimeoutError, json.JSONDecodeError):
        return None

    llm_text = response_payload.get("response")
    return llm_text if isinstance(llm_text, str) else None


def translate_content(content: str, title: str = "") -> tuple[bool, str]:
    if not content:
        return True, content

    body_content = _strip_leading_title(content, title)

    def parse_response(raw_text: str | None) -> tuple[bool, str] | None:
        if raw_text is None:
            return None

        parsed = _extract_json_object(raw_text)
        if parsed is None:
            return None

        is_english = parsed.get("is_english")
        translated_content = parsed.get("translated_content")
        if not isinstance(is_english, bool) or not isinstance(translated_content, str):
            return None

        translated_content = translated_content.strip()
        if _looks_like_bad_translation(body_content, translated_content, title):
            return None

        return is_english, translated_content

    result = parse_response(_query_ollama(body_content))
    if result is not None:
        return result

    retry_result = parse_response(_query_ollama(body_content, force_translate=True))
    if retry_result is not None:
        return retry_result

    return True, content
