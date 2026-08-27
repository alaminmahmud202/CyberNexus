"""Chatbot routes for AI-powered cybersecurity assistance."""
import json
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.deps import get_current_user
from app.services.ai_assistant import AiAssistantError, chat_message, chat_stream

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"],
    dependencies=[Depends(get_current_user)],
)


class ChatMessage(BaseModel):
    role: str = Field(min_length=1)
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str


@router.post("", response_model=ChatResponse)
async def send_message(
    payload: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> ChatResponse:
    history = None
    if payload.history:
        history = [{"role": m.role, "content": m.content} for m in payload.history]

    try:
        reply = await chat_message(payload.message, history)
    except AiAssistantError as exc:
        return ChatResponse(response=f"Sorry, I'm unable to respond: {exc}")

    return ChatResponse(response=reply)


@router.post("/stream")
async def send_message_stream(
    payload: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    history = None
    if payload.history:
        history = [{"role": m.role, "content": m.content} for m in payload.history]

    async def event_generator():
        try:
            async for token in chat_stream(payload.message, history):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except AiAssistantError as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
