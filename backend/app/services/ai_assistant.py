"""Google Gemini-powered AI assistant for scan explanations and chatbot."""
import asyncio
import json
from typing import Any, AsyncGenerator, Dict

import httpx

from app.core.config import settings

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
# Tried in order when the primary AI_MODEL is rate-limited or unavailable.
# gemini-3.5-flash-lite is the most reliable fallback (rarely 429/503).
FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash"]
TIMEOUT_SECONDS = 45.0
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
    # Try the configured model first, then fall back to other flash models.
    # Individual Gemini models regularly return transient 503 "high demand"
    # errors, so a single model choice makes the chatbot unreliable.
    models: list[str] = [model or settings.AI_MODEL]
    for candidate in FALLBACK_MODELS:
        if candidate not in models:
            models.append(candidate)

    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {
            "maxOutputTokens": MAX_OUTPUT_TOKENS,
            "temperature": 0.7,
        },
    }

    last_status: int | None = None
    last_timeout = False

    for model_name in models:
        url = f"{GEMINI_BASE_URL}/models/{model_name}:generateContent?key={api_key}"
        retried_503 = False
        while True:
            try:
                async with httpx.AsyncClient(
                    timeout=httpx.Timeout(TIMEOUT_SECONDS, connect=10.0)
                ) as client:
                    response = await client.post(url, json=payload)
            except httpx.TimeoutException:
                last_timeout = True
                break  # hung request -> fail over to the next model quickly
            except httpx.HTTPError as exc:
                raise AiAssistantError(f"AI service request failed: {exc}") from exc

            last_timeout = False
            status = response.status_code

            if status in (401, 403):
                raise AiAssistantError("Gemini rejected the configured API key")
            if status == 404:
                # Model retired or misconfigured: skip to the next model.
                last_status = status
                break
            if status == 429:
                # This model's quota is exhausted - the next model has its own
                # quota, so fail over immediately instead of waiting.
                last_status = status
                break
            if status >= 500:
                # Transient "high demand": one quick retry, then fail over.
                last_status = status
                if not retried_503:
                    retried_503 = True
                    await asyncio.sleep(1.5)
                    continue
                break

            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise AiAssistantError(f"AI service returned HTTP {status}") from exc
            return response.json()

    if last_timeout:
        raise AiAssistantError("The AI service timed out after multiple attempts")
    if last_status == 429:
        raise AiAssistantError("AI rate limit exceeded - try again shortly")
    if last_status is not None and last_status >= 500:
        raise AiAssistantError("The AI service is temporarily unavailable")
    raise AiAssistantError(f"AI service returned HTTP {last_status}")


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

    models = [model]
    for candidate in FALLBACK_MODELS:
        if candidate not in models:
            models.append(candidate)

    last_status: int | None = None
    last_timeout = False
    yielded_any = False

    for model_name in models:
        url = (
            f"{GEMINI_BASE_URL}/models/{model_name}:streamGenerateContent"
            f"?key={settings.GEMINI_API_KEY}&alt=sse"
        )
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(TIMEOUT_SECONDS, connect=10.0)
            ) as client:
                async with client.stream("POST", url, json=payload) as response:
                    status = response.status_code
                    if status in (401, 403):
                        raise AiAssistantError("Gemini rejected the configured API key")
                    if status == 404:
                        last_status = status
                        continue  # retired/unknown model -> try next
                    if status == 429 or status >= 500:
                        last_status = status
                        continue  # transient -> try next model
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            try:
                                chunk = json.loads(line[6:])
                                text = _extract_text(chunk)
                                if text:
                                    yielded_any = True
                                    yield text
                            except json.JSONDecodeError:
                                continue
            return  # streamed successfully
        except AiAssistantError:
            raise
        except httpx.TimeoutException:
            last_timeout = True
            if yielded_any:
                # Partial response already sent; restarting would duplicate text.
                raise AiAssistantError("The AI service timed out")
            continue  # try next model
        except httpx.HTTPError as exc:
            raise AiAssistantError(f"AI service request failed: {exc}") from exc

    if last_timeout and last_status is None:
        raise AiAssistantError("The AI service timed out")
    if last_status == 429:
        raise AiAssistantError("AI rate limit exceeded")
    if last_status is not None and last_status >= 500:
        raise AiAssistantError("The AI service is temporarily unavailable")
    raise AiAssistantError(f"AI service returned HTTP {last_status}")
