from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import StreakUpdate, StreakResponse, BadgeCreate, BadgeResponse
from crud import (
    get_user_by_nickname, get_user_streak, update_user_streak, 
    increment_streak, reset_streak, create_badge, get_user_badges,
    check_badge_exists
)
from datetime import datetime

router = APIRouter()

# Static data
QUOTES = [
    '"Learning another language is like becoming another person." – Haruki Murakami',
    '"The limits of my language mean the limits of my world." – Ludwig Wittgenstein',
    '"Practice makes perfect. Keep going!"',
    '"Every day is a new chance to improve your skills."',
    '"Mistakes are proof that you are trying."',
]

TIPS = [
    'Use persuasive arguments to convince the AI! 💡',
    'Try different tones: polite, passionate, formal, or casual.',
    'Switch languages to challenge yourself.',
    'Check the leaderboard to see how you rank!',
    'Collect badges for creative and high-scoring arguments.',
]

@router.get('/streak')
def get_streak(nickname: str = Query(...), db: Session = Depends(get_db)):
    """Get user's current streak"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    streak = get_user_streak(db, user.id)
    if not streak:
        return {"streak": 1}
    
    return {"streak": streak.current_streak}

@router.patch('/streak')
def update_streak(nickname: str = Query(...), streak: int = Query(..., ge=0), db: Session = Depends(get_db)):
    """Update user's streak"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    streak_update = StreakUpdate(current_streak=streak)
    updated_streak = update_user_streak(db, user.id, streak_update)
    
    if not updated_streak:
        raise HTTPException(status_code=404, detail="Streak record not found.")
    
    return {"streak": updated_streak.current_streak}

@router.post('/streak/increment')
def increment_user_streak(nickname: str = Query(...), db: Session = Depends(get_db)):
    """Increment user's streak (called when user is active)"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    updated_streak = increment_streak(db, user.id)
    if not updated_streak:
        raise HTTPException(status_code=404, detail="Streak record not found.")
    
    return {"streak": updated_streak.current_streak}

@router.post('/streak/reset')
def reset_user_streak(nickname: str = Query(...), db: Session = Depends(get_db)):
    """Reset user's streak to 1"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    updated_streak = reset_streak(db, user.id)
    if not updated_streak:
        raise HTTPException(status_code=404, detail="Streak record not found.")
    
    return {"streak": updated_streak.current_streak}

@router.get('/level')
def get_level(nickname: str = Query(...), db: Session = Depends(get_db)):
    """Get user's current level (calculated from streak)"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    streak = get_user_streak(db, user.id)
    if not streak:
        return {"level": 1}
    
    # Calculate level based on streak (simple formula)
    level = min(10, max(1, streak.current_streak // 3 + 1))
    return {"level": level}

@router.patch('/level')
def update_level(nickname: str = Query(...), level: int = Query(..., ge=1, le=10), db: Session = Depends(get_db)):
    """Update user's level by adjusting streak"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Calculate required streak for level
    required_streak = (level - 1) * 3 + 1
    streak_update = StreakUpdate(current_streak=required_streak)
    updated_streak = update_user_streak(db, user.id, streak_update)
    
    if not updated_streak:
        raise HTTPException(status_code=404, detail="Streak record not found.")
    
    return {"level": level}

@router.get('/badges/{nickname}')
def get_user_badges_endpoint(nickname: str, db: Session = Depends(get_db)):
    """Get user's badges"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    badges = get_user_badges(db, user.id)
    return {"badges": [{"type": badge.badge_type, "name": badge.badge_name, "description": badge.badge_description} for badge in badges]}

@router.post('/badges/{nickname}')
def award_badge(nickname: str, badge_type: str = Query(...), badge_name: str = Query(...), badge_description: str = Query(None), db: Session = Depends(get_db)):
    """Award a badge to user"""
    user = get_user_by_nickname(db, nickname)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Check if badge already exists
    if check_badge_exists(db, user.id, badge_type):
        return {"message": "Badge already awarded", "badge_type": badge_type}
    
    badge = BadgeCreate(
        badge_type=badge_type,
        badge_name=badge_name,
        badge_description=badge_description
    )
    
    db_badge = create_badge(db, user.id, badge)
    return {"message": "Badge awarded", "badge": {"type": db_badge.badge_type, "name": db_badge.badge_name}}

@router.get('/quotes', response_model=List[str])
def get_quotes():
    """Get motivational quotes"""
    return QUOTES

@router.get('/tips', response_model=List[str])
def get_tips():
    """Get game tips"""
    return TIPS 