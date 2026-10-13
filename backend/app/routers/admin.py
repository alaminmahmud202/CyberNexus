"""Admin routes: user management, system statistics, and platform administration."""
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.deps import get_current_admin, parse_object_id
from app.db.collections import scan_history, users
from app.db.mongodb import get_database


class RoleUpdateRequest(BaseModel):
    role: str = Field(min_length=1, max_length=20)


router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("/stats", response_model=Dict[str, Any])
async def get_system_stats(
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> Dict[str, Any]:
    """Get system-wide statistics."""
    db = get_database()
    
    total_users = await users(db).count_documents({})
    total_scans = await scan_history(db).count_documents({})
    
    # Get scans by type
    pipeline = [
        {"$group": {"_id": "$serviceType", "count": {"$sum": 1}}}
    ]
    scans_by_type = {}
    results = await scan_history(db).aggregate(pipeline)
    for doc in results:
        scans_by_type[doc["_id"]] = doc["count"]
    
    return {
        "totalUsers": total_users,
        "totalScans": total_scans,
        "scansByType": scans_by_type,
    }


@router.get("/users", response_model=List[Dict[str, Any]])
async def list_users(
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> List[Dict[str, Any]]:
    """List all users (admin only)."""
    db = get_database()
    cursor = (
        users(db)
        .find({}, {"passwordHash": 0})
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
    )
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results


@router.get("/users/{user_id}", response_model=Dict[str, Any])
async def get_user(
    user_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> Dict[str, Any]:
    """Get a specific user by ID (admin only)."""
    db = get_database()
    oid = parse_object_id(user_id, "User not found")
    user = await users(db).find_one({"_id": oid}, {"passwordHash": 0})
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    user["id"] = str(user.pop("_id"))
    return user


@router.patch("/users/{user_id}/role", response_model=Dict[str, Any])
async def update_user_role(
    user_id: str,
    payload: RoleUpdateRequest,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> Dict[str, Any]:
    """Update a user's role (admin only)."""
    role = payload.role
    if role not in ["user", "admin"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid role")
    
    db = get_database()
    oid = parse_object_id(user_id, "User not found")
    
    updated = await users(db).find_one_and_update(
        {"_id": oid},
        {"$set": {"role": role}},
        return_document=True,
    )
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    
    updated.pop("passwordHash", None)
    updated["id"] = str(updated.pop("_id"))
    return updated


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_admin: Dict[str, Any] = Depends(get_current_admin),
) -> None:
    """Delete a user (admin only)."""
    db = get_database()
    oid = parse_object_id(user_id, "User not found")
    
    # Don't allow deleting yourself
    if str(oid) == current_admin["id"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot delete your own account")
    
    result = await users(db).delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")