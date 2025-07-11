import sqlite3
from fastapi import APIRouter, Query, HTTPException, status, Body
from typing import List, Optional
import os
from pydantic import BaseModel
import random

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(__file__), 'engagement.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        nickname TEXT PRIMARY KEY,
        streak INTEGER DEFAULT 1,
        level INTEGER DEFAULT 1
    )''')
    # Demo users (only if not present)
    for user, streak, level in [('alice', 5, 4), ('bob', 3, 2), ('guest', 1, 1)]:
        c.execute('INSERT OR IGNORE INTO users (nickname, streak, level) VALUES (?, ?, ?)', (user, streak, level))
    conn.commit()
    conn.close()

init_db()

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

def get_user(nickname: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT streak, level FROM users WHERE nickname = ?', (nickname.lower(),))
    row = c.fetchone()
    conn.close()
    return row

class StreakResponse(BaseModel):
    streak: int

class LevelResponse(BaseModel):
    level: int

class QuoteResponse(BaseModel):
    quote: str

class TipResponse(BaseModel):
    tip: str

class StreakUpdateRequest(BaseModel):
    nickname: str
    streak: int | None = None
    increment: int | None = None

class LevelUpdateRequest(BaseModel):
    nickname: str
    level: int | None = None
    increment: int | None = None

class UserCreateRequest(BaseModel):
    nickname: str
    streak: int = 1
    level: int = 1

class UserResponse(BaseModel):
    nickname: str
    streak: int
    level: int

class UserListResponse(BaseModel):
    users: list[UserResponse]

@router.get('/streak', response_model=StreakResponse, responses={404: {"description": "User not found"}})
def get_streak(nickname: str = Query(...)):
    """Get the current streak for a user by nickname."""
    user = get_user(nickname)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return {"streak": user[0]}

@router.get('/level', response_model=LevelResponse, responses={404: {"description": "User not found"}})
def get_level(nickname: str = Query(...)):
    """Get the current level for a user by nickname."""
    user = get_user(nickname)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    return {"level": user[1]}

@router.patch('/streak', response_model=StreakResponse, responses={404: {"description": "User not found"}})
def update_streak(data: StreakUpdateRequest = Body(...)):
    """Update a user's streak (set or increment)."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT streak FROM users WHERE nickname = ?', (data.nickname.lower(),))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    current = row[0]
    if data.streak is not None:
        new_streak = data.streak
    elif data.increment is not None:
        new_streak = current + data.increment
    else:
        conn.close()
        raise HTTPException(status_code=400, detail='No update value provided')
    c.execute('UPDATE users SET streak = ? WHERE nickname = ?', (new_streak, data.nickname.lower()))
    conn.commit()
    conn.close()
    return {"streak": new_streak}

@router.patch('/level', response_model=LevelResponse, responses={404: {"description": "User not found"}})
def update_level(data: LevelUpdateRequest = Body(...)):
    """Update a user's level (set or increment)."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT level FROM users WHERE nickname = ?', (data.nickname.lower(),))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    current = row[0]
    if data.level is not None:
        new_level = data.level
    elif data.increment is not None:
        new_level = current + data.increment
    else:
        conn.close()
        raise HTTPException(status_code=400, detail='No update value provided')
    c.execute('UPDATE users SET level = ? WHERE nickname = ?', (new_level, data.nickname.lower()))
    conn.commit()
    conn.close()
    return {"level": new_level}

@router.post('/user', response_model=UserResponse, status_code=201, responses={409: {"description": "User already exists"}})
def create_user(data: UserCreateRequest = Body(...)):
    """Create a new user with nickname, streak, and level."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (nickname, streak, level) VALUES (?, ?, ?)', (data.nickname.lower(), data.streak, data.level))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail='User already exists')
    conn.close()
    return {"nickname": data.nickname.lower(), "streak": data.streak, "level": data.level}

@router.get('/users', response_model=UserListResponse)
def list_users():
    """List all users with their streak and level."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT nickname, streak, level FROM users')
    users = [UserResponse(nickname=row[0], streak=row[1], level=row[2]) for row in c.fetchall()]
    conn.close()
    return {"users": users}

@router.delete('/user', status_code=204, responses={404: {"description": "User not found"}})
def delete_user(nickname: str = Query(...)):
    """Delete a user by nickname."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT 1 FROM users WHERE nickname = ?', (nickname.lower(),))
    if not c.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail='User not found')
    c.execute('DELETE FROM users WHERE nickname = ?', (nickname.lower(),))
    conn.commit()
    conn.close()
    return None

@router.get('/quotes', response_model=List[str])
def get_quotes():
    """Get all motivational quotes."""
    return QUOTES

@router.get('/tips', response_model=List[str])
def get_tips():
    """Get all quick tips."""
    return TIPS 

@router.get('/quote', response_model=QuoteResponse)
def get_random_quote():
    """Get a random motivational quote."""
    return {"quote": random.choice(QUOTES)}

@router.get('/tip', response_model=TipResponse)
def get_random_tip():
    """Get a random quick tip."""
    return {"tip": random.choice(TIPS)} 