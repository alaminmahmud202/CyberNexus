"""FastAPI dependencies for request authentication."""
from typing import Any, Dict, Optional

from bson import ObjectId
from bson.errors import InvalidId
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


def parse_object_id(value: str, detail: str = "Resource not found") -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """Validate the bearer JWT and load the matching user from MongoDB."""
    if credentials is None:
        raise _unauthorized("Missing bearer token")

    try:
        claims = decode_token(credentials.credentials)
    except JWTError:
        raise _unauthorized("Invalid or expired token")

    if claims.get("type") != "access":
        raise _unauthorized("Access token required")

    try:
        object_id = ObjectId(claims.get("sub"))
    except (InvalidId, TypeError):
        raise _unauthorized("Invalid token subject")

    user = await users(get_database()).find_one({"_id": object_id})
    if user is None:
        raise _unauthorized("User no longer exists")

    user.pop("passwordHash", None)
    return {
        "id": str(user.pop("_id")),
        "name": user["name"],
        "email": user["email"],
        "createdAt": user["createdAt"],
    }
