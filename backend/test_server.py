from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import re
from ai_service import ai_service
from simple_nlp_services import (
    SimpleSentimentAnalyzer as EnhancedSentimentAnalyzer,
    SimpleArgumentEvaluator as ArgumentEvaluator,
    SimpleConversationalAI as ConversationalAI,
    SimpleSpeechToText as SpeechToText
)

# Initialize services once at startup
sentiment_analyzer = EnhancedSentimentAnalyzer()
argument_evaluator = ArgumentEvaluator()
conversational_ai = ConversationalAI()

# Simple translation without heavy ML models for testing
LANG_CODE_MAP = {
    'en': 'eng_Latn',
    'twi': 'aka_Latn',
    'gaa': 'gaa_Latn',
    'ewe': 'ewe_Latn',
    'es': 'spa_Latn',
    'de': 'deu_Latn',
    'pt': 'por_Latn',
    'sw': 'swh_Latn',
    'yo': 'yor_Latn',
    'ha': 'hau_Latn',
}

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
    return [
        {
            "nickname": "testuser",
            "avatar_url": None,
            "total_score": 100,
            "games_played": 5,
            "current_streak": 3,
            "highest_score": 25
        }
    ]

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

@app.get("/api/v1/level")
def get_level(nickname: str):
    """Get user's current level (simplified)"""
    return {"level": 1}

@app.patch("/api/v1/streak")
def reset_streak(nickname: str, streak: int):
    """Reset user's streak (simplified)"""
    return {"streak": streak}

@app.patch("/api/v1/level")
def reset_level(nickname: str, level: int):
    """Reset user's level (simplified)"""
    return {"level": level}

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
    """Get a random scenario based on category and difficulty with simple translation"""
    import random
    category = request.get("category", "general") if request else "general"
    difficulty = request.get("difficulty", "medium") if request else "medium"
    language = request.get("language", "en") if request else "en"

    scenarios = {
        "daily": {
            "beginner": [
                "Convince your friend to join you for morning exercise.",
                "Persuade your sibling to help with household chores.",
                "Encourage your neighbor to recycle more often."
            ],
            "intermediate": [
                "Persuade your colleague to try a new healthy lunch spot.",
                "Convince your roommate to start a weekly cleaning schedule.",
                "Encourage your friend to take up a new hobby with you."
            ],
            "advanced": [
                "Convince your family to adopt a more sustainable lifestyle.",
                "Persuade your community group to organize a charity event.",
                "Encourage your friends to participate in a local marathon."
            ]
        },
        "business": {
            "beginner": [
                "Convince your manager to approve a team building activity.",
                "Persuade a coworker to swap shifts with you.",
                "Encourage your team to use a new productivity tool."
            ],
            "intermediate": [
                "Persuade stakeholders to invest in a new project idea.",
                "Convince your boss to let you lead a meeting.",
                "Encourage your department to adopt flexible work hours."
            ],
            "advanced": [
                "Convince the board to implement a major company restructuring.",
                "Persuade your company to expand into a new market.",
                "Encourage executives to invest in employee wellness programs."
            ]
        },
        "social": {
            "beginner": [
                "Convince your friend to try a new restaurant.",
                "Persuade your group to play a board game.",
                "Encourage your friends to go on a weekend trip."
            ],
            "intermediate": [
                "Persuade your group to watch a movie you recommend.",
                "Convince your friends to volunteer at a local shelter.",
                "Encourage your club to host a themed party."
            ],
            "advanced": [
                "Convince your community to support a local initiative.",
                "Persuade your friends to start a book club.",
                "Encourage your neighborhood to organize a clean-up day."
            ]
        },
        "academic": {
            "beginner": [
                "Convince your classmate to join a study group.",
                "Persuade your friend to attend a workshop with you.",
                "Encourage your peer to participate in a school competition."
            ],
            "intermediate": [
                "Persuade your professor to extend a deadline.",
                "Convince your classmates to collaborate on a project.",
                "Encourage your study group to try a new learning method."
            ],
            "advanced": [
                "Convince the school administration to implement a new program.",
                "Persuade your department to fund a research trip.",
                "Encourage your university to host an international conference."
            ]
        }
    }

    # Get a random scenario for the selected category and difficulty
    category_dict = scenarios.get(category, scenarios["daily"])
    scenario_list = category_dict.get(difficulty, category_dict["beginner"])
    scenario = random.choice(scenario_list)

    # Translate scenario if language is not English using simple translation
    if language != "en":
        try:
            translation_request = {
                "text": scenario,
                "src_lang": "en",
                "tgt_lang": language
            }
            translated_result = translate_text(translation_request)
            if translated_result["translated_text"] != scenario:
                return {"scenario": translated_result["translated_text"], "language": language}
        except Exception as e:
            print(f"Translation failed: {e}")
            return {"scenario": f"{scenario} [Translation not available for {language}]", "language": "en"}

    return {"scenario": scenario, "language": language}

@app.post("/translate")
def translate_text(request: dict):
    """Translate text to the target language (simplified)"""
    text = request.get("text", "")
    src_lang = request.get("src_lang", "en")
    tgt_lang = request.get("tgt_lang", "twi")
    
    # Simple translation mapping for demonstration
    # In a real implementation, this would use a proper translation service
    translations = {
        "hello": "ɛte sɛn",
        "good": "yɛ",
        "bad": "bone",
        "yes": "aane",
        "no": "daabi",
        "please": "yɛ ma wo",
        "thank you": "meda wo ase",
        "sorry": "kafra",
        "help": "boa",
        "work": "adwuma",
        "friend": "adamfo",
        "family": "abusua",
        "time": "bere",
        "money": "sika",
        "food": "aaduan",
        "water": "nsu",
        "house": "fie",
        "car": "kaa",
        "book": "nhoma",
        "school": "sukuu",
        "teacher": "kyerɛkyerɛfo",
        "student": "sukuufo",
        "study": "sua",
        "learn": "sua",
        "understand": "te ase",
        "think": "dwen",
        "know": "nim",
        "want": "pɛ",
        "need": "hia",
        "can": "tumi",
        "will": "bɛ",
        "should": "ɛsɛ",
        "must": "ɛsɛ",
        "because": "ɛfiri sɛ",
        "therefore": "ɛno nti",
        "however": "nanso",
        "although": "ɛwom sɛ",
        "but": "nanso",
        "and": "ne",
        "or": "anaa",
        "if": "sɛ",
        "when": "bere a",
        "where": "bea a",
        "why": "ɛden nti",
        "how": "sɛnea",
        "what": "deɛn",
        "who": "hwan",
        "which": "deɛn",
        "exercise": "adwuma",
        "health": "yare",
        "healthy": "yare",
        "benefit": "mfaso",
        "advantage": "mfaso",
        "improve": "yɛ yie",
        "support": "boa",
        "evidence": "adanse",
        "research": "hwɛ",
        "study": "sua",
        "experience": "nyansahu",
        "together": "ka ho",
        "community": "kurom",
        "future": "daakye",
        "growth": "kɔ so",
        "success": "yɛ yie",
        "positive": "yɛ",
        "impact": "nsɛm"
    }
    
    # Simple word-by-word translation
    words = text.lower().split()
    translated_words = []
    
    for word in words:
        # Clean the word (remove punctuation)
        clean_word = ''.join(c for c in word if c.isalnum())
        if clean_word in translations:
            translated_words.append(translations[clean_word])
        else:
            # For unknown words, keep the original or add a placeholder
            translated_words.append(f"[{clean_word}]")
    
    translated_text = " ".join(translated_words)
    
    # If no translations found, return a placeholder
    if translated_text == text or not translated_words:
        translated_text = f"[Translated to {tgt_lang.upper()}: {text}]"
    
    return {"translated_text": translated_text}

@app.post("/evaluate")
def evaluate_argument(request: dict):
    """Evaluate the persuasiveness of an argument using enhanced NLP services"""
    argument = request.get("argument", "")
    tone = request.get("tone", "polite")
    scenario = request.get("scenario", "General persuasion scenario")
    

    try:
        # Analyze sentiment
        sentiment_result = sentiment_analyzer.analyze_sentiment(argument)
        tone_result = sentiment_analyzer.analyze_tone(argument)
        
        # Evaluate argument with context
        eval_result = argument_evaluator.evaluate_argument(
            argument=argument,
            topic=scenario,
            tone=tone
        )
        
        score = eval_result.get('score', 0)
        feedback = eval_result.get('feedback', [])
        persuaded = eval_result.get('persuaded', False)
        
        # Add sentiment-based feedback
        sentiment = sentiment_result['sentiment']
        sentiment_confidence = sentiment_result['confidence']
        
        if sentiment == 'positive' and sentiment_confidence > 0.6:
            score += 5
            feedback.append("Your argument has a positive, persuasive tone.")
        elif sentiment == 'negative' and sentiment_confidence > 0.6:
            score -= 3
            feedback.append("Your argument sounds negative or confrontational.")
        else:
            feedback.append("Your argument is neutral in sentiment.")
        
        # Add tone feedback
        dominant_tone = tone_result['dominant_tone']
        tone_confidence = tone_result['confidence']
        
        if tone_confidence > 0.5:
            if dominant_tone == 'polite':
                feedback.append("Your polite tone enhances persuasiveness.")
            elif dominant_tone == 'passionate':
                feedback.append("Your passionate tone shows conviction.")
            elif dominant_tone == 'confrontational':
                feedback.append("Consider a more respectful tone.")
        
        return {
            "persuaded": persuaded,
            "feedback": " ".join(feedback),
            "score": score,
            "strengths": [
                f"Sentiment: {sentiment} (confidence: {sentiment_confidence:.2f})",
                f"Dominant tone: {dominant_tone} (confidence: {tone_confidence:.2f})"
            ],
            "suggestions": eval_result.get('suggestions', [])
        }
    
    except Exception as e:
        print(f"Evaluation error: {e}")
        return {
            "persuaded": False,
            "feedback": "Evaluation error.",
            "score": 0,
            "strengths": [],
            "suggestions": []
        }

@app.post("/dialogue")
def dialogue(request: dict):
    """Generate AI dialogue response with enhanced NLP and multilingual support"""
    scenario = request.get("scenario", "")
    user_argument = request.get("user_argument", "")
    ai_stance = request.get("ai_stance", "disagree")
    language = request.get("language", "twi")
    
    try:
        
        # Generate AI response using conversational model
        context = [f"Scenario: {scenario}"] if scenario else []
        ai_response = conversational_ai.generate_response(
            user_input=user_argument,
            context=context,
            personality="neutral",
            stance=ai_stance
        )
        
        # Evaluate argument strength
        eval_result = argument_evaluator.evaluate_argument(
            argument=user_argument,
            topic=scenario,
            tone="neutral"
        )
        
        score = eval_result.get('score', 0)
        current_stance = ai_stance
        
        # Update stance based on argument strength
        if score >= 75:
            if current_stance == 'disagree':
                new_stance = 'neutral'
            elif current_stance == 'neutral':
                new_stance = 'agree'
            else:
                new_stance = 'agree'
        elif score >= 50:
            if current_stance == 'disagree':
                new_stance = 'neutral'
            else:
                new_stance = current_stance
        else:
            if current_stance == 'agree':
                new_stance = 'neutral'
            else:
                new_stance = current_stance
        
        # Translate response if needed
        if language != "en":
            try:
                translation_request = {
                    "text": ai_response,
                    "src_lang": "en",
                    "tgt_lang": language
                }
                translated_result = translate_text(translation_request)
                ai_response = translated_result["translated_text"]
            except Exception as e:
                print(f"Translation error: {e}")
                # Fall back to English with a note
                ai_response = f"{ai_response} [Translation not available]"
                language = "en"
        
        return {
            "ai_response": ai_response,
            "new_stance": new_stance,
            "reasoning": eval_result.get('feedback', [''])[0]  # Use first feedback item as reasoning
        }
        
    except Exception as e:
        print(f"Dialogue error: {e}")
        # Provide a fallback response
        return {
            "ai_response": "I understand your point. Can you elaborate?",
            "new_stance": ai_stance,
            "reasoning": "Error processing dialogue."
        }

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

@app.get("/api/v1/progression/{nickname}")
def get_user_progression(nickname: str):
    """Get user's progression stages (test implementation)"""
    # Return predefined progression stages
    return [
        {
            "id": "basics",
            "label": "Language Basics",
            "unlocked": True,
            "children": [
                {
                    "id": "basics_1",
                    "label": "Introduction",
                    "unlocked": True,
                    "children": []
                },
                {
                    "id": "basics_2",
                    "label": "Simple Phrases",
                    "unlocked": False,
                    "children": []
                },
                {
                    "id": "basics_3",
                    "label": "Basic Grammar",
                    "unlocked": False,
                    "children": []
                }
            ]
        },
        {
            "id": "intermediate",
            "label": "Intermediate Skills",
            "unlocked": False,
            "children": [
                {
                    "id": "intermediate_1",
                    "label": "Advanced Phrases",
                    "unlocked": False,
                    "children": []
                },
                {
                    "id": "intermediate_2",
                    "label": "Complex Grammar",
                    "unlocked": False,
                    "children": []
                }
            ]
        },
        {
            "id": "advanced",
            "label": "Advanced Topics",
            "unlocked": False,
            "children": [
                {
                    "id": "advanced_1",
                    "label": "Idiomatic Expressions",
                    "unlocked": False,
                    "children": []
                },
                {
                    "id": "advanced_2",
                    "label": "Cultural Context",
                    "unlocked": False,
                    "children": []
                }
            ]
        }
    ]

@app.post("/api/v1/progression/{nickname}/unlock/{stage_id}")
def unlock_stage(nickname: str, stage_id: str):
    """Unlock a progression stage for a user (test implementation)"""
    # In a real implementation, this would update the database
    return {"message": "Stage unlocked successfully"}

@app.post("/api/v1/progression/{nickname}/reset")
def reset_progression(nickname: str):
    """Reset user's progression stages to initial state (test implementation)"""
    # In a real implementation, this would reset stages in the database
    return {"message": "Progression reset successfully"}

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

