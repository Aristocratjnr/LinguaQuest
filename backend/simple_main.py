from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from user_api import router as user_router
from game_api import router as game_router
from engagement_api_v2 import router as engagement_v2_router
from simple_nlp_services import (
    SimpleSentimentAnalyzer, 
    SimpleArgumentEvaluator, 
    SimpleConversationalAI,
    SimpleSpeechToText
)
import tempfile
import os
from typing import Optional, Dict, Any

app = FastAPI()

# Initialize simple NLP services
sentiment_analyzer = SimpleSentimentAnalyzer()
argument_evaluator = SimpleArgumentEvaluator()
conversational_ai = SimpleConversationalAI()
speech_to_text = SimpleSpeechToText()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include database routers
app.include_router(user_router, prefix="/api/v1", tags=["users"])
app.include_router(game_router, prefix="/api/v1", tags=["game"])
app.include_router(engagement_v2_router, prefix="/api/v1", tags=["engagement"])

@app.get("/")
def read_root():
    return {
        "message": "LinguaQuest API is running!",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "docs": "/docs",
            "api": "/api/v1",
            "health": "/health",
            "nlp": {
                "stt": "/stt",
                "evaluate": "/evaluate",
                "dialogue": "/dialogue",
                "sentiment": "/sentiment"
            }
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# --- Pydantic Models ---
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
    strengths: Optional[list] = None
    suggestions: Optional[list] = None

class DialogueRequest(BaseModel):
    scenario: str
    user_argument: str
    ai_stance: str = "disagree"
    language: str = "en"

class DialogueResponse(BaseModel):
    ai_response: str
    new_stance: str
    reasoning: Optional[str] = None

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    scores: Dict[str, float]
    dominant_tone: str
    tone_scores: Dict[str, float]

# --- NLP Endpoints ---

@app.post("/stt", response_model=TranscriptionResponse)
async def speech_to_text_endpoint(
    audio_file: UploadFile = File(...),
    language: str = Query("en")
):
    """Convert speech to text using simple placeholder service"""
    try:
        # Read audio file
        audio_bytes = await audio_file.read()
        
        # For now, return a placeholder response since this requires additional dependencies
        # In a real implementation, you would process the audio bytes
        return TranscriptionResponse(
            transcription="Speech-to-text feature is not fully implemented yet. Please type your argument.",
            confidence=0.0,
            language=language,
            success=False,
            error="Speech-to-text requires additional dependencies (Whisper)"
        )
        
    except Exception as e:
        print(f"Speech-to-text error: {e}")
        return TranscriptionResponse(
            transcription="",
            confidence=0.0,
            language=language,
            success=False,
            error=str(e)
        )

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate_argument(request: EvaluateRequest):
    """Evaluate the persuasiveness of an argument"""
    try:
        # Analyze sentiment and tone
        sentiment_result = sentiment_analyzer.analyze_sentiment(request.argument)
        tone_result = sentiment_analyzer.analyze_tone(request.argument)
        
        # Evaluate argument
        eval_result = argument_evaluator.evaluate_argument(
            argument=request.argument,
            topic=request.scenario or "general discussion",
            tone=request.tone
        )
        
        return EvaluateResponse(
            persuaded=eval_result.get('persuaded', False),
            feedback=eval_result.get('feedback', ['Good argument!'])[0],
            score=eval_result.get('score', 50.0),
            strengths=[f"Sentiment: {sentiment_result['sentiment']}", f"Tone: {tone_result['dominant_tone']}"],
            suggestions=eval_result.get('suggestions', [])
        )
        
    except Exception as e:
        print(f"Evaluation error: {e}")
        return EvaluateResponse(
            persuaded=False,
            feedback="Error during evaluation.",
            score=0.0,
            strengths=[],
            suggestions=[]
        )

@app.post("/dialogue", response_model=DialogueResponse)
def dialogue_endpoint(request: DialogueRequest):
    """Generate AI dialogue response"""
    try:
        # Generate AI response
        ai_response = conversational_ai.generate_response(
            user_input=request.user_argument,
            context=[f"Scenario: {request.scenario}"],
            personality="neutral",
            stance=request.ai_stance
        )
        
        # Simple stance logic based on argument length/quality
        new_stance = request.ai_stance
        if len(request.user_argument) > 100 and any(word in request.user_argument.lower() for word in ['because', 'important', 'beneficial', 'helps', 'good']):
            if request.ai_stance == 'disagree':
                new_stance = 'neutral'
            elif request.ai_stance == 'neutral':
                new_stance = 'agree'
        
        return DialogueResponse(
            ai_response=ai_response,
            new_stance=new_stance,
            reasoning="Simple rule-based stance change"
        )
        
    except Exception as e:
        print(f"Dialogue error: {e}")
        return DialogueResponse(
            ai_response="I understand your point. Can you elaborate?",
            new_stance=request.ai_stance,
            reasoning="Error processing dialogue."
        )

@app.post("/sentiment", response_model=SentimentResponse)
def sentiment_endpoint(request: SentimentRequest):
    """Analyze sentiment and tone of text"""
    try:
        sentiment_result = sentiment_analyzer.analyze_sentiment(request.text)
        tone_result = sentiment_analyzer.analyze_tone(request.text)
        
        return SentimentResponse(
            sentiment=sentiment_result['sentiment'],
            confidence=sentiment_result['confidence'],
            scores=sentiment_result['scores'],
            dominant_tone=tone_result['dominant_tone'],
            tone_scores=tone_result['tone_scores']
        )
        
    except Exception as e:
        print(f"Sentiment analysis error: {e}")
        return SentimentResponse(
            sentiment="neutral",
            confidence=0.0,
            scores={"positive": 0.0, "neutral": 1.0, "negative": 0.0},
            dominant_tone="neutral",
            tone_scores={"neutral": 1.0}
        ) 