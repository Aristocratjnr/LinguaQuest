from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import UserCreate, UserUpdate, UserResponse, ActivityCreate, ActivityResponse
from crud import (
    create_user, get_user_by_nickname, get_user_by_id, update_user, 
    update_user_last_login, create_activity, get_user_activities
)
import re

router = APIRouter()

# Profanity list for username validation
PROFANITY_LIST = {"badword", "admin", "root", "test", "guest", "anonymous"}

@router.post("/users", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    # Validate nickname
    name = user.nickname.strip()
    if not (3 <= len(name) <= 16):
        raise HTTPException(status_code=400, detail="Nickname must be 3-16 characters.")
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        raise HTTPException(status_code=400, detail="Only letters, numbers, and underscores allowed.")
    if name.lower() in PROFANITY_LIST:
        raise HTTPException(status_code=400, detail="Nickname not allowed.")
    
    # Check if user already exists
    existing_user = get_user_by_nickname(db, name)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")
    
    # Create user
    db_user = create_user(db, user)
    
    # Log activity
    activity = ActivityCreate(activity_type="user_created", details={"nickname": name})
    create_activity(db, db_user.id, activity)
    
    return db_user

@router.get("/users/{nickname}", response_model=UserResponse)
def get_user(nickname: str, db: Session = Depends(get_db)):
    """Get user by nickname"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

@router.put("/users/{nickname}", response_model=UserResponse)
def update_user_profile(nickname: str, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update user profile"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    updated_user = update_user(db, user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Log activity
    activity = ActivityCreate(activity_type="profile_updated", details={"updated_fields": list(user_update.dict(exclude_unset=True).keys())})
    create_activity(db, user.id, activity)
    
    return updated_user

@router.post("/users/{nickname}/login")
def user_login(nickname: str, db: Session = Depends(get_db)):
    """Record user login"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    update_user_last_login(db, user.id)
    
    # Log activity
    activity = ActivityCreate(activity_type="login", details={"timestamp": "now"})
    create_activity(db, user.id, activity)
    
    return {"success": True, "message": "Login recorded"}

@router.get("/users/{nickname}/activities", response_model=List[ActivityResponse])
def get_user_activity_history(nickname: str, limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db)):
    """Get user activity history"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    activities = get_user_activities(db, user.id, limit)
    return activities

@router.get("/users/validate")
def validate_username(nickname: str = Query(...)):
    """Validate username (for frontend validation)"""
    name = nickname.strip()
    if not (3 <= len(name) <= 16):
        return {"valid": False, "reason": "Nickname must be 3-16 characters."}
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        return {"valid": False, "reason": "Only letters, numbers, and underscores allowed."}
    if name.lower() in PROFANITY_LIST:
        return {"valid": False, "reason": "Nickname not allowed."}
    return {"valid": True, "reason": "Looks good!"} 