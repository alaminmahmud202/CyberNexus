"""Google Gemini-powered AI assistant for scan explanations and chatbot."""
import asyncio
import json
from typing import Any, AsyncGenerator, Dict

import httpx

from app.core.config import settings

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
TIMEOUT_SECONDS = 90.0
MAX_PROMPT_CHARS = 6000
MAX_OUTPUT_TOKENS = 1024

SCAN_SYSTEM_PROMPT = (
    "You are a senior cybersecurity analyst writing for non-experts. "
    "Explain the provided security scan result in plain language. "
    "Be concise and factual: start with a one-sentence verdict, then 2-5 "
    "short bullet lines starting with '- ' covering the key findings, then "
    "one line beginning with 'Recommended action:' with a concrete next step. "
    "Maximum 180 words. Do not use emoji or markdown headers."
)

CHAT_SYSTEM_PROMPT = (
    "You are CyberNexus AI, a cybersecurity assistant embedded in the CyberNexus "
    "security platform. You help users understand security scans, interpret results, "
    "and provide cybersecurity guidance. Be concise, professional, and helpful. "
    "You can explain what different scan results mean, suggest security best practices, "
    "and help users understand threats. Keep responses under 300 words unless asked for detail. "
    "Do not use emoji. Use plain language suitable for both technical and non-technical users."
)


class AiAssistantError(Exception):
    pass


def _missing_key_result() -> Dict[str, Any]:
    return {
        "status": "error",
        "model": None,
        "explanation": "",
        "error": {
            "code": "missing_api_key",
            "message": "GEMINI_API_KEY is not configured on the server. "
            "Add it to backend/.env and restart the API.",
        },
    }


def _build_scan_prompt(document: Dict[str, Any]) -> str:
    payload = json.dumps(
        {
            "service_type": document.get("serviceType"),
            "scan_status": document.get("status"),
            "input": document.get("input"),
            "result": document.get("result", {}),
        },
        indent=2,
        default=str,
    )
    if len(payload) > MAX_PROMPT_CHARS:
        payload = payload[:MAX_PROMPT_CHARS] + "\n... (truncated)"
    return f"Security scan result to explain:\n{payload}"


async def _call_gemini(
    contents: list[Dict[str, str]],
    system_instruction: str,
    api_key: str,
    model: str | None = None,
    retries: int = 2,
) -> Dict[str, Any]:
    model = model or settings.AI_MODEL
    url = f"{GEMINI_BASE_URL}/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {
            "maxOutputTokens": MAX_OUTPUT_TOKENS,
            "temperature": 0.7,
        },
    }

    last_error = None
    for attempt in range(retries + 1):
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                response = await client.post(url, json=payload)
            break
        except httpx.TimeoutException as exc:
            last_error = exc
            if attempt < retries:
                await asyncio.sleep(2 * (attempt + 1))
                continue
            raise AiAssistantError("The AI service timed out after multiple attempts") from exc
        except httpx.HTTPError as exc:
            raise AiAssistantError(f"AI service request failed: {exc}") from exc

    if response.status_code in (401, 403):
        raise AiAssistantError("Gemini rejected the configured API key")
    if response.status_code == 429:
        raise AiAssistantError("AI rate limit exceeded - try again shortly")
    if response.status_code >= 500:
        raise AiAssistantError("The AI service is temporarily unavailable")
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise AiAssistantError(f"AI service returned HTTP {response.status_code}") from exc
    return response.json()


def _extract_text(data: Dict[str, Any]) -> str:
    candidates = data.get("candidates", [])
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts).strip()


async def explain_scan_result(document: Dict[str, Any]) -> Dict[str, Any]:
    """Return {status, model, explanation[, error]} for a ScanHistory document."""
    if not settings.GEMINI_API_KEY:
        return _missing_key_result()

    contents = [{"role": "user", "parts": [{"text": _build_scan_prompt(document)}]}]
    data = await _call_gemini(contents, SCAN_SYSTEM_PROMPT, settings.GEMINI_API_KEY)

    text = _extract_text(data)
    if not text:
        raise AiAssistantError("The AI service returned an empty explanation")

    model_used = data.get("modelVersion", settings.AI_MODEL)
    return {"status": "ok", "model": model_used, "explanation": text}


async def chat_message(
    message: str,
    history: list[Dict[str, str]] | None = None,
) -> str:
    """Send a chat message and return the response text."""
    if not settings.GEMINI_API_KEY:
        raise AiAssistantError(
            "GEMINI_API_KEY is not configured. Add it to backend/.env and restart."
        )

    contents = []
    if history:
        for msg in history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

    contents.append({"role": "user", "parts": [{"text": message}]})

    data = await _call_gemini(contents, CHAT_SYSTEM_PROMPT, settings.GEMINI_API_KEY)

    text = _extract_text(data)
    if not text:
        raise AiAssistantError("The AI service returned an empty response")
    return text


async def chat_stream(
    message: str,
    history: list[Dict[str, str]] | None = None,
) -> AsyncGenerator[str, None]:
    """Stream a chat response token by token."""
    if not settings.GEMINI_API_KEY:
        raise AiAssistantError(
            "GEMINI_API_KEY is not configured. Add it to backend/.env and restart."
        )

    model = settings.AI_MODEL
    url = f"{GEMINI_BASE_URL}/models/{model}:streamGenerateContent?key={settings.GEMINI_API_KEY}&alt=sse"

    contents = []
    if history:
        for msg in history[-10:]:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": CHAT_SYSTEM_PROMPT}]},
        "generationConfig": {
            "maxOutputTokens": MAX_OUTPUT_TOKENS,
            "temperature": 0.7,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code in (401, 403):
                    raise AiAssistantError("Gemini rejected the configured API key")
                if response.status_code == 429:
                    raise AiAssistantError("AI rate limit exceeded")
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        try:
                            chunk = json.loads(line[6:])
                            text = _extract_text(chunk)
                            if text:
                                yield text
                        except json.JSONDecodeError:
                            continue
    except AiAssistantError:
        raise
    except httpx.TimeoutException:
        raise AiAssistantError("The AI service timed out")
    except httpx.HTTPError as exc:
        raise AiAssistantError(f"AI service request failed: {exc}")
