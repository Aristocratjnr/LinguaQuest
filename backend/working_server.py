#!/usr/bin/env python3
"""
Simple working server for LinguaQuest with speech-to-text endpoint
"""

from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Create FastAPI app
app = FastAPI(title="LinguaQuest API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TranscriptionResponse(BaseModel):
    transcription: str
    confidence: float
    language: str
    success: bool
    error: Optional[str] = None

class EvaluateRequest(BaseModel):
    argument: str
    tone: str = "polite"
    scenario: Optional[str] = None

class EvaluateResponse(BaseModel):
    persuaded: bool
    feedback: str
    score: float

@app.get("/")
def root():
    return {
        "message": "LinguaQuest API is running!",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "stt": "/stt",
            "evaluate": "/evaluate"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "LinguaQuest Backend"}

@app.post("/stt", response_model=TranscriptionResponse)
async def speech_to_text(
    audio_file: UploadFile = File(...),
    language: str = Query("en", description="Language code")
):
    """
    Speech-to-text endpoint (placeholder implementation)
    In production, this would use Whisper or similar service
    """
    try:
        # Read the uploaded audio file
        audio_bytes = await audio_file.read()
        file_size = len(audio_bytes)
        
        # For now, return a helpful message since we don't have Whisper set up
        return TranscriptionResponse(
            transcription=f"Speech-to-text received {file_size} bytes of audio data. This is a placeholder - real implementation would use Whisper to transcribe the audio.",
            confidence=0.0,
            language=language,
            success=False,
            error="Speech-to-text feature requires Whisper installation"
        )
        
    except Exception as e:
        return TranscriptionResponse(
            transcription="",
            confidence=0.0,
            language=language,
            success=False,
            error=f"Error processing audio: {str(e)}"
        )

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(request: EvaluateRequest):
    """
    Simple argument evaluation endpoint
    """
    try:
        argument = request.argument
        tone = request.tone
        
        # Simple scoring based on length and keywords
        score = min(100, len(argument.split()) * 2 + 30)
        
        # Check for persuasive keywords
        persuasive_words = ["because", "therefore", "important", "beneficial", "helps", "improves"]
        if any(word in argument.lower() for word in persuasive_words):
            score += 20
        
        persuaded = score >= 70
        
        if score >= 80:
            feedback = "Excellent argument! Very persuasive."
        elif score >= 60:
            feedback = "Good argument with solid points."
        else:
            feedback = "Your argument could use more detail and evidence."
        
        return EvaluateResponse(
            persuaded=persuaded,
            feedback=feedback,
            score=float(score)
        )
        
    except Exception as e:
        return EvaluateResponse(
            persuaded=False,
            feedback=f"Error evaluating argument: {str(e)}",
            score=0.0
        )

@app.post("/dialogue")
def dialogue_endpoint(request: dict):
    """
    Simple dialogue endpoint
    """
    try:
        scenario = request.get("scenario", "")
        user_argument = request.get("user_argument", "")
        ai_stance = request.get("ai_stance", "disagree")
        
        # Simple response based on stance
        responses = {
            "disagree": "I understand your point, but I have some concerns about this approach.",
            "neutral": "That's an interesting perspective. Let me consider this further.",
            "agree": "You make a compelling argument. I'm starting to see your point."
        }
        
        # Simple stance progression
        new_stance = ai_stance
        if len(user_argument) > 50:  # If argument is substantial
            if ai_stance == "disagree":
                new_stance = "neutral"
            elif ai_stance == "neutral":
                new_stance = "agree"
        
        return {
            "ai_response": responses.get(ai_stance, "I understand your perspective."),
            "new_stance": new_stance,
            "reasoning": "Simple rule-based response"
        }
        
    except Exception as e:
        return {
            "ai_response": "I'm having trouble processing your argument right now.",
            "new_stance": request.get("ai_stance", "disagree"),
            "reasoning": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    print("🚀 Starting LinguaQuest Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🎤 Speech-to-text endpoint: POST /stt")
    print("🧠 Argument evaluation: POST /evaluate")
    print("💬 Dialogue generation: POST /dialogue")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
