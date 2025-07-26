#!/usr/bin/env python3
"""
Minimal LinguaQuest API for Render deployment
This version removes heavy ML models to ensure deployment works
"""
import os
import sys
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
            "evaluate": "/evaluate"
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
