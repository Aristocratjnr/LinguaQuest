from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Profanity list for username validation
PROFANITY_LIST = {"badword", "admin", "root", "test", "guest", "anonymous"}

@app.get("/")
def read_root():
    return {"message": "LinguaQuest API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/users/validate")
def validate_username(nickname: str):
    """Validate username (for frontend validation)"""
    name = nickname.strip()
    if not (3 <= len(name) <= 16):
        return {"valid": False, "reason": "Nickname must be 3-16 characters."}
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        return {"valid": False, "reason": "Only letters, numbers, and underscores allowed."}
    if name.lower() in PROFANITY_LIST:
        return {"valid": False, "reason": "Nickname not allowed."}
    return {"valid": True, "reason": "Looks good!"}

@app.post("/api/v1/users")
def create_user(user_data: dict):
    """Create a new user (simplified)"""
    return {
        "id": 1,
        "nickname": user_data.get("nickname", ""),
        "avatar_url": user_data.get("avatar_url"),
        "created_at": "2024-01-01T00:00:00Z",
        "total_score": 0,
        "games_played": 0,
        "current_streak": 1,
        "highest_streak": 1
    }

@app.get("/api/v1/leaderboard")
def get_leaderboard(limit: int = 100):
    """Get leaderboard data (simplified)"""
    return {
        "leaderboard": [
            {
                "nickname": "testuser",
                "avatar_url": None,
                "total_score": 100,
                "games_played": 5,
                "current_streak": 3,
                "highest_score": 25
            }
        ]
    }

@app.post("/api/v1/scores")
def submit_score(score_data: dict, nickname: str):
    """Submit a new score (simplified)"""
    return {
        "id": 1,
        "user_id": 1,
        "score": score_data.get("score", 0),
        "created_at": "2024-01-01T00:00:00Z"
    }

@app.get("/api/v1/streak")
def get_streak(nickname: str):
    """Get user's current streak (simplified)"""
    return {"streak": 1}

@app.post("/api/v1/streak/increment")
def increment_streak(nickname: str):
    """Increment user's streak (simplified)"""
    return {"streak": 2}

@app.post("/api/v1/badges/{nickname}")
def award_badge(nickname: str, badge_type: str, badge_name: str, badge_description: str | None = None):
    """Award a badge to user (simplified)"""
    return {"message": "Badge awarded", "badge": {"type": badge_type, "name": badge_name}}

# Legacy endpoints for backward compatibility
@app.post("/score")
def submit_score_legacy(score_data: dict):
    return {"success": True}

@app.get("/leaderboard")
def get_leaderboard_legacy():
    return {"leaderboard": []}

@app.post("/scenario")
def get_scenario(request: dict | None = None):
    """Get a scenario based on category and difficulty"""
    # Generate different scenarios based on category and difficulty
    category = request.get("category", "daily") if request else "daily"
    difficulty = request.get("difficulty", "beginner") if request else "beginner"
    
    scenarios = {
        "daily": {
            "beginner": "Convince your friend to join you for morning exercise.",
            "intermediate": "Persuade your colleague to try a new healthy lunch spot.",
            "advanced": "Convince your family to adopt a more sustainable lifestyle."
        },
        "business": {
            "beginner": "Convince your manager to approve a team building activity.",
            "intermediate": "Persuade stakeholders to invest in a new project idea.",
            "advanced": "Convince the board to implement a major company restructuring."
        },
        "social": {
            "beginner": "Convince your friend to try a new restaurant.",
            "intermediate": "Persuade your group to watch a movie you recommend.",
            "advanced": "Convince your community to support a local initiative."
        },
        "academic": {
            "beginner": "Convince your classmate to join a study group.",
            "intermediate": "Persuade your professor to extend a deadline.",
            "advanced": "Convince the school administration to implement a new program."
        }
    }
    
    # Get scenario based on category and difficulty, with fallbacks
    scenario = scenarios.get(category, scenarios["daily"]).get(difficulty, scenarios["daily"]["beginner"])
    
    return {"scenario": scenario, "language": "twi"}

@app.post("/translate")
def translate_text(request: dict):
    return {"translated_text": request.get("text", "")}

@app.post("/evaluate")
def evaluate_argument(request: dict):
    return {"persuaded": True, "feedback": "Good argument!", "score": 8}

@app.post("/dialogue")
def dialogue(request: dict):
    return {"ai_response": "I agree with you!", "new_stance": "agree"}

# Game options and categories endpoints
@app.get("/api/v1/game/categories")
def get_game_categories():
    """Get available game categories"""
    return {
        "categories": [
            {"id": "daily", "name": "Daily Challenge", "description": "Practice with daily scenarios"},
            {"id": "business", "name": "Business", "description": "Professional communication scenarios"},
            {"id": "social", "name": "Social", "description": "Casual conversation scenarios"},
            {"id": "academic", "name": "Academic", "description": "Educational and learning scenarios"}
        ]
    }

@app.get("/api/v1/game/difficulties")
def get_game_difficulties():
    """Get available difficulty levels"""
    return {
        "difficulties": [
            {"id": "beginner", "name": "Beginner", "description": "Easy scenarios for new players"},
            {"id": "intermediate", "name": "Intermediate", "description": "Moderate challenge level"},
            {"id": "advanced", "name": "Advanced", "description": "Complex scenarios for experienced players"}
        ]
    }

@app.get("/api/v1/game/options")
def get_game_options():
    """Get all game options including categories and difficulties"""
    return {
        "categories": [
            {"id": "daily", "name": "Daily Challenge", "description": "Practice with daily scenarios"},
            {"id": "business", "name": "Business", "description": "Professional communication scenarios"},
            {"id": "social", "name": "Social", "description": "Casual conversation scenarios"},
            {"id": "academic", "name": "Academic", "description": "Educational and learning scenarios"}
        ],
        "difficulties": [
            {"id": "beginner", "name": "Beginner", "description": "Easy scenarios for new players"},
            {"id": "intermediate", "name": "Intermediate", "description": "Moderate challenge level"},
            {"id": "advanced", "name": "Advanced", "description": "Complex scenarios for experienced players"}
        ],
        "languages": [
            {"code": "twi", "label": "Twi"},
            {"code": "gaa", "label": "Ga"},
            {"code": "ewe", "label": "Ewe"}
        ]
    }

@app.get("/api/v1/quotes")
def get_quotes():
    """Get motivational quotes"""
    return [
        '"Learning another language is like becoming another person." – Haruki Murakami',
        '"The limits of my language mean the limits of my world." – Ludwig Wittgenstein',
        '"Practice makes perfect. Keep going!"',
        '"Every day is a new chance to improve your skills."',
        '"Mistakes are proof that you are trying."'
    ]

@app.get("/api/v1/tips")
def get_tips():
    """Get game tips"""
    return [
        'Use persuasive arguments to convince the AI! 💡',
        'Try different tones: polite, passionate, formal, or casual.',
        'Switch languages to challenge yourself.',
        'Check the leaderboard to see how you rank!',
        'Collect badges for creative and high-scoring arguments.'
    ]

# Engagement endpoints (for backward compatibility)
@app.get("/api/engagement/categories")
def get_engagement_categories():
    """Get game categories (legacy endpoint)"""
    return [
        {"key": "daily", "label": "Daily Challenge", "icon": "today"},
        {"key": "business", "label": "Business", "icon": "work"},
        {"key": "social", "label": "Social", "icon": "people"},
        {"key": "academic", "label": "Academic", "icon": "school"}
    ]

@app.get("/api/engagement/difficulties")
def get_engagement_difficulties():
    """Get game difficulties (legacy endpoint)"""
    return [
        {"key": "beginner", "label": "Beginner"},
        {"key": "intermediate", "label": "Intermediate"},
        {"key": "advanced", "label": "Advanced"}
    ]

@app.get("/api/engagement/validate_username")
def validate_username_legacy(nickname: str):
    """Validate username (legacy endpoint)"""
    name = nickname.strip()
    if not (3 <= len(name) <= 16):
        return {"valid": False, "reason": "Nickname must be 3-16 characters."}
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        return {"valid": False, "reason": "Only letters, numbers, and underscores allowed."}
    if name.lower() in PROFANITY_LIST:
        return {"valid": False, "reason": "Nickname not allowed."}
    return {"valid": True, "reason": "Looks good!"}

# Additional endpoints that might be needed
@app.get("/api/v1/stats/{nickname}")
def get_user_stats(nickname: str):
    """Get user statistics (simplified)"""
    return {
        "total_score": 150,
        "games_played": 3,
        "average_score": 50,
        "highest_score": 85,
        "current_streak": 2,
        "highest_streak": 5,
        "total_rounds_played": 15,
        "badges_count": 2
    }

@app.get("/api/v1/sessions/{session_id}")
def get_session_details(session_id: str):
    """Get game session details (simplified)"""
    return {
        "id": 1,
        "user_id": 1,
        "session_id": session_id,
        "start_time": "2024-01-01T00:00:00Z",
        "end_time": None,
        "total_score": 0,
        "rounds_played": 0,
        "status": "active"
    }

@app.put("/api/v1/sessions/{session_id}")
def update_session(session_id: str, session_data: dict):
    """Update game session (simplified)"""
    return {
        "id": 1,
        "user_id": 1,
        "session_id": session_id,
        "start_time": "2024-01-01T00:00:00Z",
        "end_time": session_data.get("end_time"),
        "total_score": session_data.get("total_score", 0),
        "rounds_played": session_data.get("rounds_played", 0),
        "status": session_data.get("status", "active")
    }

@app.post("/api/v1/sessions")
def create_session(session_data: dict, nickname: str):
    """Create a new game session (simplified)"""
    return {
        "id": 1,
        "user_id": 1,
        "session_id": "test-session-123",
        "start_time": "2024-01-01T00:00:00Z",
        "end_time": None,
        "total_score": 0,
        "rounds_played": 0,
        "status": "active"
    } 