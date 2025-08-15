from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from services.ai_service import ai_service
from services.translation_service import translation_service

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])

class TranslationRequest(BaseModel):
    """Request model for translation."""
    text: str = Field(..., description="Text to translate")
    source_language: str = Field(..., description="Source language code (e.g., 'en', 'fr', 'es')")
    target_language: str = Field(..., description="Target language code (e.g., 'es', 'fr', 'en')")
    format: str = Field("text", description="Format of the input text ('text' or 'html')")

class TranslationResponse(BaseModel):
    """Response model for translation."""
    success: bool
    translated_text: Optional[str] = None
    source_language: str
    target_language: str
    detected_language: Optional[str] = None
    confidence: Optional[float] = None
    error: Optional[str] = None

class EvaluationRequest(BaseModel):
    """Request model for argument evaluation."""
    argument: str = Field(..., description="The argument to evaluate")
    scenario: str = Field(..., description="The scenario/context of the argument")
    language: str = Field("en", description="Language of the argument (default: 'en')")
    tone: Optional[str] = Field(None, description="Tone of the argument (e.g., 'formal', 'casual')")

class EvaluationResponse(BaseModel):
    """Response model for argument evaluation."""
    success: bool
    evaluation: Optional[Dict[str, Any]] = None
    response: Optional[str] = None
    error: Optional[str] = None

class ChatMessage(BaseModel):
    """Chat message model."""
    role: str = Field(..., description="Role of the message sender ('user', 'assistant', 'system')")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    """Request model for chat completion."""
    messages: List[ChatMessage] = Field(..., description="List of messages in the conversation")
    temperature: float = Field(0.7, description="Controls randomness (0.0 to 2.0)")
    max_tokens: int = Field(500, description="Maximum number of tokens to generate")

class ChatResponse(BaseModel):
    """Response model for chat completion."""
    success: bool
    response: str
    model: str
    usage: Optional[Dict[str, int]] = None
    error: Optional[str] = None

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate text from one language to another.
    
    Supports translation between multiple languages including English, French, Spanish, and several African languages.
    """
    try:
        result = translation_service.translate(
            text=request.text,
            source_lang=request.source_language,
            target_lang=request.target_language,
            format=request.format
        )
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Translation failed')
            )
            
        return {
            'success': True,
            'translated_text': result['translated_text'],
            'source_language': request.source_language,
            'target_language': request.target_language,
            'detected_language': result.get('detected_language'),
            'confidence': result.get('confidence')
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation error: {str(e)}"
        )

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_argument(request: EvaluationRequest):
    """
    Evaluate the persuasiveness of an argument.
    
    Returns scores for persuasiveness, clarity, relevance, and emotional appeal,
    along with an overall evaluation and suggestions for improvement.
    """
    try:
        result = await ai_service.evaluate_argument(
            argument=request.argument,
            scenario=request.scenario,
            language=request.language,
            tone=request.tone
        )
        
        if not result.get('success', False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Evaluation failed')
            )
            
        return {
            'success': True,
            'evaluation': result.get('evaluation', {}),
            'response': result.get('response', '')
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation error: {str(e)}"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """
    Generate a chat completion using the AI model.
    
    This endpoint allows for a back-and-forth conversation with the AI,
    maintaining context from previous messages in the conversation.
    """
    try:
        # Convert Pydantic model to list of dicts expected by the service
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        result = await ai_service.generate_response(
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        if not result.get('success', False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get('error', 'Chat completion failed')
            )
            
        return {
            'success': True,
            'response': result.get('response', ''),
            'model': result.get('model', 'unknown'),
            'usage': result.get('usage')
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat completion error: {str(e)}"
        )

@router.get("/languages")
async def get_supported_languages():
    """
    Get the list of supported languages for translation.
    
    Returns a mapping of language codes to language names.
    """
    try:
        return {
            'success': True,
            'languages': translation_service.supported_languages
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve supported languages: {str(e)}"
        )
