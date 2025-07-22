from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from database import get_db, User, UserStreak, UserScore, UserActivity
import json

router = APIRouter()

class XPUpdate(BaseModel):
    xp_amount: int
    activity_type: str
    details: Optional[dict] = None

class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: datetime
    next_activity_due: datetime
    xp_multiplier: float

# Helper functions
def get_user_by_nickname(db: Session, nickname: str) -> Optional[User]:
    return db.query(User).filter(User.nickname == nickname).first()

def calculate_streak_multiplier(streak: int) -> float:
    """Calculate XP multiplier based on streak length"""
    if streak >= 30:
        return 2.0  # 2x multiplier for 30+ day streak
    elif streak >= 14:
        return 1.5  # 1.5x multiplier for 14+ day streak
    elif streak >= 7:
        return 1.25  # 1.25x multiplier for 7+ day streak
    return 1.0

def get_or_create_user_streak(db: Session, user_id: int) -> UserStreak:
    """Get or create a streak record for a user"""
    streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
    if not streak:
        streak = UserStreak(
            user_id=user_id,
            current_streak=0,
            longest_streak=0,
            last_activity_date=datetime.utcnow() - timedelta(days=1)  # Set to yesterday to allow first streak today
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)
    return streak

def update_streak(db: Session, user_id: int, force_reset: bool = False) -> UserStreak:
    """Update user's streak based on activity"""
    streak = get_or_create_user_streak(db, user_id)
    now = datetime.utcnow()
    
    if force_reset:
        streak.current_streak = 1
        streak.last_activity_date = now
        db.commit()
        return streak
    
    # Calculate days since last activity
    days_since_last = (now - streak.last_activity_date).days
    
    # If activity is from the same day, don't update streak
    if days_since_last == 0:
        return streak
    
    # If exactly one day has passed, increment streak
    if days_since_last == 1:
        streak.current_streak += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
    # If more than one day has passed, reset streak
    else:
        streak.current_streak = 1
    
    streak.last_activity_date = now
    db.commit()
    db.refresh(streak)
    return streak

def add_xp(db: Session, user_id: int, xp_amount: int, activity_type: str, details: dict = None) -> UserScore:
    """Add XP to user's score with streak multiplier"""
    # Get current streak
    streak = get_or_create_user_streak(db, user_id)
    multiplier = calculate_streak_multiplier(streak.current_streak)
    
    # Calculate XP with streak multiplier
    final_xp = int(xp_amount * multiplier)
    
    # Create score entry
    score = UserScore(
        user_id=user_id,
        score=final_xp,
        language="system",  # Use 'system' for XP entries
        category=activity_type
    )
    db.add(score)
    
    # Create activity record
    activity = UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        details={
            "xp_base": xp_amount,
            "xp_multiplier": multiplier,
            "xp_final": final_xp,
            **(details or {})
        }
    )
    db.add(activity)
    
    db.commit()
    db.refresh(score)
    return score

@router.get("/streak/{nickname}", response_model=StreakInfo)
async def get_user_streak(nickname: str, db: Session = Depends(get_db)):
    """Get user's current streak information"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    streak = get_or_create_user_streak(db, user.id)
    next_activity = streak.last_activity_date + timedelta(days=1)
    
    return StreakInfo(
        current_streak=streak.current_streak,
        longest_streak=streak.longest_streak,
        last_activity_date=streak.last_activity_date,
        next_activity_due=next_activity,
        xp_multiplier=calculate_streak_multiplier(streak.current_streak)
    )

@router.post("/streak/{nickname}/update")
async def update_user_streak(nickname: str, db: Session = Depends(get_db)):
    """Update user's streak"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    streak = update_streak(db, user.id)
    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "xp_multiplier": calculate_streak_multiplier(streak.current_streak)
    }

@router.post("/xp/{nickname}/add")
async def add_user_xp(nickname: str, xp_update: XPUpdate, db: Session = Depends(get_db)):
    """Add XP to user's total and update streak"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update streak first
    streak = update_streak(db, user.id)
    
    # Add XP with current streak multiplier
    score = add_xp(
        db,
        user.id,
        xp_update.xp_amount,
        xp_update.activity_type,
        xp_update.details
    )
    
    return {
        "xp_added": score.score,
        "current_streak": streak.current_streak,
        "xp_multiplier": calculate_streak_multiplier(streak.current_streak)
    }

@router.get("/xp/{nickname}/total")
async def get_user_total_xp(nickname: str, db: Session = Depends(get_db)):
    """Get user's total XP"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_xp = db.query(func.sum(UserScore.score)).filter(
        UserScore.user_id == user.id
    ).scalar() or 0
    
    return {
        "total_xp": total_xp,
        "level": calculate_level(total_xp)
    }

def calculate_level(total_xp: int) -> int:
    """Calculate user level based on total XP"""
    # Level thresholds: Each level requires more XP than the previous
    # Level 1: 0-999 XP
    # Level 2: 1000-2999 XP
    # Level 3: 3000-5999 XP
    # And so on...
    if total_xp < 1000:
        return 1
    
    level = 1
    xp_required = 1000
    while total_xp >= xp_required:
        level += 1
        xp_required += 1000 * level
    
    return level
