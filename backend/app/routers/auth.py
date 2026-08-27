"""Authentication routes: registration, login, refresh, and current-user session."""
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError

from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.collections import serialize_doc, users
from app.db.mongodb import get_database
from app.models.schemas import TokenPair, UserCreate, UserLogin, UserPublic

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
async def register(payload: UserCreate) -> UserPublic:
    db = get_database()
    email = payload.email.lower()

    if await users(db).find_one({"email": email}) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    doc = {
        "name": payload.name.strip(),
        "email": email,
        "passwordHash": hash_password(payload.password),
        "createdAt": datetime.now(timezone.utc),
    }
    await users(db).insert_one(doc)
    return UserPublic(**serialize_doc(doc))


@router.post("/login", response_model=TokenPair)
async def login(payload: UserLogin) -> TokenPair:
    db = get_database()
    user = await users(db).find_one({"email": payload.email.lower()})

    if user is None or not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject = str(user["_id"])
    return TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


@router.get("/me", response_model=UserPublic)
async def me(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> UserPublic:
    return UserPublic(**current_user)


from pydantic import BaseModel


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(payload: RefreshRequest) -> TokenPair:
    try:
        claims = decode_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if claims.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    subject = claims.get("sub")
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    db = get_database()
    from bson import ObjectId
    user = await users(db).find_one({"_id": ObjectId(subject)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    return TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )
