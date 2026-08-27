"""Pydantic schemas for the CyberNexus API and MongoDB documents."""
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field


class HealthCheck(BaseModel):
    status: str
    service: str


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    createdAt: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ScanHistoryRecord(BaseModel):
    id: str
    userId: str
    serviceType: str
    input: str
    result: Dict[str, Any] = Field(default_factory=dict)
    status: str
    createdAt: datetime
    durationMs: Optional[int] = None


class SearchHistoryRecord(BaseModel):
    id: str
    userId: str
    query: str = Field(min_length=1)
    searchType: str = Field(min_length=1)
    createdAt: datetime


class ReportRecord(BaseModel):
    id: str
    userId: str
    scanId: str
    serviceType: str
    title: str
    content: Dict[str, Any] = Field(default_factory=dict)
    createdAt: datetime


class NotificationRecord(BaseModel):
    id: str
    userId: str
    message: str
    status: str = Field(default="unread", min_length=1)
    taskId: Optional[str] = None
    createdAt: datetime


class ReportCreateRequest(BaseModel):
    scanId: str = Field(min_length=1)
    title: Optional[str] = Field(default=None, max_length=120)


class TaskRecord(BaseModel):
    id: str
    userId: str
    type: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    createdAt: datetime
    updatedAt: datetime


class PasswordScanRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)


class SslScanRequest(BaseModel):
    host: str = Field(min_length=1, max_length=253)
    port: int = Field(default=443, ge=1, le=65535)


class SecurityHeadersScanRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)


class EmailHeaderScanRequest(BaseModel):
    raw_headers: str = Field(min_length=1, max_length=100_000)


class UrlScanRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)


class DomainScanRequest(BaseModel):
    domain: str = Field(min_length=1, max_length=253)


class IpScanRequest(BaseModel):
    ip: str = Field(min_length=1, max_length=45)


class ExplanationResponse(BaseModel):
    status: str
    model: Optional[str] = None
    explanation: str = ""
    error: Optional[Dict[str, str]] = None
