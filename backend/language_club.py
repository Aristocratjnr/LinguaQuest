from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from database import get_db, User, UserScore, UserActivity, UserStreak

router = APIRouter()

class ClubMember(BaseModel):
    nickname: str
    xp: int
    avatar: Optional[str] = None
    current_streak: int
    longest_streak: int
    level: int

class ClubData(BaseModel):
    name: str
    members: List[ClubMember]
    group_goal: int
    group_progress: int
    challenge: str
    last_updated: datetime

def calculate_level(xp: int) -> int:
    """Calculate user level based on total XP"""
    if xp < 1000:
        return 1
    level = 1
    xp_required = 1000
    while xp >= xp_required:
        level += 1
        xp_required += 1000 * level
    return level

def get_active_challenge() -> str:
    """Get the current active challenge"""
    now = datetime.utcnow()
    # Weekly challenges that rotate
    challenges = [
        "Complete 5 lessons this week",
        "Maintain a 7-day streak",
        "Score 1000+ XP this week",
        "Help 3 other learners"
    ]
    week_number = now.isocalendar()[1]
    return challenges[week_number % len(challenges)]

def calculate_group_goal(member_count: int) -> int:
    """Calculate group goal based on member count"""
    base_goal = 5000  # Base XP goal
    per_member_goal = 1000  # Additional XP per member
    return base_goal + (member_count * per_member_goal)

@router.get("/clubs/{language_code}", response_model=ClubData)
async def get_language_club(language_code: str, db: Session = Depends(get_db)):
    """Get language club data for a specific language"""
    # Get all users who have activity in this language
    active_users = (
        db.query(User)
        .join(UserScore)
        .filter(UserScore.language == language_code)
        .distinct()
        .all()
    )

    members = []
    total_xp = 0

    for user in active_users:
        # Calculate user's total XP for this language
        user_xp = (
            db.query(func.sum(UserScore.score))
            .filter(
                UserScore.user_id == user.id,
                UserScore.language == language_code
            )
            .scalar() or 0
        )

        # Get user's streak info
        streak = (
            db.query(UserStreak)
            .filter(UserStreak.user_id == user.id)
            .first()
        )

        if user_xp > 0:  # Only include users with XP
            members.append(ClubMember(
                nickname=user.nickname,
                xp=user_xp,
                avatar=user.avatar,
                current_streak=streak.current_streak if streak else 0,
                longest_streak=streak.longest_streak if streak else 0,
                level=calculate_level(user_xp)
            ))
            total_xp += user_xp

    if not members:
        return ClubData(
            name=f"{language_code.upper()} Language Club",
            members=[],
            group_goal=1000,  # default group goal
            group_progress=0,
            challenge="No challenge yet!",
            last_updated=datetime.utcnow()
        )

    # Sort members by XP
    members.sort(key=lambda x: (-x.xp, x.nickname))

    # Calculate group goal
    group_goal = calculate_group_goal(len(members))

    return ClubData(
        name=f"{language_code.upper()} Language Club",
        members=members,
        group_goal=group_goal,
        group_progress=total_xp,
        challenge=get_active_challenge(),
        last_updated=datetime.utcnow()
    )

@router.get("/clubs/{language_code}/members/{nickname}", response_model=ClubMember)
async def get_club_member(language_code: str, nickname: str, db: Session = Depends(get_db)):
    """Get specific member's club data"""
    user = db.query(User).filter(User.nickname == nickname).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user's XP for this language
    user_xp = (
        db.query(func.sum(UserScore.score))
        .filter(
            UserScore.user_id == user.id,
            UserScore.language == language_code
        )
        .scalar() or 0
    )

    # Get user's streak
    streak = (
        db.query(UserStreak)
        .filter(UserStreak.user_id == user.id)
        .first()
    )

    return ClubMember(
        nickname=user.nickname,
        xp=user_xp,
        avatar=user.avatar,
        current_streak=streak.current_streak if streak else 0,
        longest_streak=streak.longest_streak if streak else 0,
        level=calculate_level(user_xp)
    )
