"""FastAPI dependencies for request authentication."""
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.core.security import decode_token
from app.db.collections import USERS, users
from app.db.mongodb import get_database

bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _forbidden(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=detail,
    )


def parse_object_id(value: str, detail: str = "Resource not found") -> ObjectId:
    if not value or len(value) != 24:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return ObjectId(value)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """Validate the bearer JWT and load the matching user from database."""
    if credentials is None:
        raise _unauthorized("Missing bearer token")

    try:
        claims = decode_token(credentials.credentials)
    except JWTError:
        raise _unauthorized("Invalid or expired token")

    if claims.get("type") != "access":
        raise _unauthorized("Access token required")

    subject = claims.get("sub")
    if not subject:
        raise _unauthorized("Invalid token subject")

    # Convert string subject to ObjectId for MongoDB query
    user = await users(get_database()).find_one({"_id": ObjectId(subject)})
    if user is None:
        raise _unauthorized("User no longer exists")

    user.pop("passwordHash", None)
    return {
        "id": str(user.pop("_id")),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "createdAt": user["createdAt"],
    }


async def get_current_admin(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Dependency to ensure the current user is an admin."""
    if current_user.get("role") != "admin":
        raise _forbidden("Admin access required")
    return current_user


