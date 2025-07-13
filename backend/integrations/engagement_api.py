from fastapi import APIRouter, Query, HTTPException
from typing import List
from pydantic import BaseModel
import re

router = APIRouter()

# In-memory demo data (replace with DB in production)
USER_STREAKS = {
    'alice': 5,
    'bob': 3,
    'guest': 1,
}
USER_LEVELS = {
    'alice': 4,
    'bob': 2,
    'guest': 1,
}
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

PROFANITY_LIST = {"badword", "admin", "root", "test"}  # Add more as needed

class UserCreate(BaseModel):
    nickname: str

@router.post('/user')
def create_user(user: UserCreate):
    key = user.nickname.lower()
    if key in USER_STREAKS:
        raise HTTPException(status_code=400, detail="User already exists.")
    USER_STREAKS[key] = 1
    USER_LEVELS[key] = 1
    return {"success": True, "nickname": user.nickname}

@router.get('/streak')
def get_streak(nickname: str = Query(...)):
    return {"streak": USER_STREAKS.get(nickname.lower(), 1)}

@router.get('/level')
def get_level(nickname: str = Query(...)):
    return {"level": USER_LEVELS.get(nickname.lower(), 1)}

@router.get('/quotes', response_model=List[str])
def get_quotes():
    return QUOTES

@router.get('/tips', response_model=List[str])
def get_tips():
    return TIPS

@router.get('/validate_username')
def validate_username(nickname: str = Query(...)):
    name = nickname.strip()
    if not (3 <= len(name) <= 16):
        return {"valid": False, "reason": "Nickname must be 3-16 characters."}
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        return {"valid": False, "reason": "Only letters, numbers, and underscores allowed."}
    if name.lower() in PROFANITY_LIST:
        return {"valid": False, "reason": "Nickname not allowed."}
    if name.lower() in USER_STREAKS:
        return {"valid": False, "reason": "Nickname already taken."}
    return {"valid": True, "reason": "Looks good!"} 