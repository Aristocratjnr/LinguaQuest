# Mock implementations of the required classes
class SimpleTranslator:
    def translate(self, text, src_lang, tgt_lang):
        return f"[MOCK TRANSLATION: {text}]"

class SentimentAnalyzer:
    def analyze(self, text):
        return 0.1  # Slightly positive sentiment

class ArgumentEvaluator:
    def evaluate(self, argument, tone):
        return {
            "score": 5,
            "feedback": ["This is mock feedback."],
            "persuaded": len(argument) > 20
        }

# Mock router for FastAPI
from fastapi import APIRouter, Query
router = APIRouter()

@router.get("/streak")
def get_streak(nickname: str = Query(...)):
    return {"streak": 3}

@router.get("/level")
def get_level(nickname: str = Query(...)):
    return {"level": 2}

@router.get("/quotes")
def get_quotes():
    return ["Language is the road map of a culture.", "To learn a language is to have one more window from which to look at the world."]

@router.get("/tips")
def get_tips():
    return ["Practice daily!", "Try speaking with native speakers."]

@router.get("/categories")
def get_categories():
    """Get available categories for game selection"""
    return [
        {"key": "food", "label": "Food", "icon": "restaurant"},
        {"key": "environment", "label": "Environment", "icon": "eco"},
        {"key": "technology", "label": "Technology", "icon": "devices"},
        {"key": "culture", "label": "Culture", "icon": "diversity_3"},
        {"key": "education", "label": "Education", "icon": "school"},
        {"key": "health", "label": "Health", "icon": "health_and_safety"},
    ]

@router.get("/difficulties")
def get_difficulties():
    """Get available difficulty levels for game selection"""
    return [
        {"key": "easy", "label": "Easy"},
        {"key": "medium", "label": "Medium"},
        {"key": "hard", "label": "Hard"},
    ]