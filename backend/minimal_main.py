#!/usr/bin/env python3
"""
Minimal LinguaQuest API for Render deployment
This version removes heavy ML models to ensure deployment works
"""
import os
import sys
import re
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import uvicorn

app = FastAPI(title="LinguaQuest API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic scenarios for testing
SCENARIOS_EN = [
    "I think eating fast food is enjoyable.",
    "I prefer to work early in the morning.",
    "I believe it is important to work hard in school.",
    "Technology makes our lives easier.",
    "Social media brings people together.",
]

class ScenarioRequest(BaseModel):
    category: str = "general"
    difficulty: str = "medium"
    language: str = "en"

class ScenarioResponse(BaseModel):
    scenario: str
    language: str

class EvaluateRequest(BaseModel):
    argument: str
    tone: str = "neutral"

class EvaluateResponse(BaseModel):
    persuaded: bool
    feedback: str
    score: int

class UserValidationResponse(BaseModel):
    valid: bool
    reason: str

# Profanity list for username validation
PROFANITY_LIST = {"badword", "admin", "root", "test", "guest", "anonymous"}

@app.get("/users/validate", response_model=UserValidationResponse)
def validate_username(nickname: str = Query(...)):
    """Validate username - minimal version without database"""
    name = nickname.strip()
    
    # Length validation
    if not (3 <= len(name) <= 16):
        return UserValidationResponse(valid=False, reason="Nickname must be 3-16 characters.")
    
    # Character validation (only alphanumeric and underscores)
    if not re.match(r'^[A-Za-z0-9_]+$', name):
        return UserValidationResponse(valid=False, reason="Only letters, numbers, and underscores allowed.")
    
    # Profanity filter
    if name.lower() in PROFANITY_LIST:
        return UserValidationResponse(valid=False, reason="Nickname not allowed.")
    
    # In minimal version, we accept all valid names (no database check)
    return UserValidationResponse(valid=True, reason="Looks good!")

@app.get("/")
def read_root():
    """Root endpoint - API status"""
    return {
        "message": "LinguaQuest API is running!",
        "version": "1.0.0-minimal",
        "status": "active",
        "port": os.environ.get("PORT", "not set"),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "scenario": "/scenario",
            "evaluate": "/evaluate",
            "users/validate": "/users/validate"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "port": os.environ.get("PORT", "not set"),
        "message": "LinguaQuest Minimal API is running successfully"
    }

@app.post("/scenario", response_model=ScenarioResponse)
def get_scenario(req: ScenarioRequest):
    """Get a debate scenario"""
    try:
        scenario = random.choice(SCENARIOS_EN)
        return ScenarioResponse(scenario=scenario, language="en")
    except Exception as e:
        print(f"Scenario error: {e}")
        return ScenarioResponse(scenario="Error generating scenario.", language="en")

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(req: EvaluateRequest):
    """Simple argument evaluation"""
    try:
        # Simple scoring based on length and basic keywords
        score = min(10, len(req.argument.split()) // 2)
        
        # Basic persuasion check
        persuasive_words = ["because", "therefore", "however", "moreover", "furthermore"]
        persuaded = any(word in req.argument.lower() for word in persuasive_words)
        
        feedback = f"Your argument has {len(req.argument.split())} words. "
        if persuaded:
            feedback += "Good use of persuasive language!"
        else:
            feedback += "Try using more connecting words like 'because' or 'therefore'."
        
        return EvaluateResponse(
            persuaded=persuaded,
            feedback=feedback,
            score=score
        )
    except Exception as e:
        print(f"Evaluation error: {e}")
        return EvaluateResponse(persuaded=False, feedback="Evaluation error.", score=0)

# Engagement API endpoints
@app.get("/api/engagement/categories")
def get_engagement_categories():
    """Get available categories for scenarios"""
    return [
        {"key": "general", "label": "General Discussion"},
        {"key": "technology", "label": "Technology"},
        {"key": "education", "label": "Education"},
        {"key": "environment", "label": "Environment"},
        {"key": "social", "label": "Social Issues"},
        {"key": "business", "label": "Business"}
    ]

@app.get("/api/engagement/difficulties")
def get_engagement_difficulties():
    """Get available difficulty levels"""
    return [
        {"key": "easy", "label": "Easy"},
        {"key": "medium", "label": "Medium"},
        {"key": "hard", "label": "Hard"}
    ]

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting LinguaQuest Minimal API on port {port}")
    print(f"📍 Host: 0.0.0.0")
    print(f"🌐 Health check: http://0.0.0.0:{port}/health")
    
    uvicorn.run(
        "minimal_main:app",
        host="0.0.0.0",
        port=port,
        workers=1,
        log_level="info"
    )
