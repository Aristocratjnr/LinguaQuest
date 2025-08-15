import os
import openai
from typing import Dict, List, Optional, Any
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class AIService:
    """
    A service for handling AI-related functionality using the OpenAI API.
    """
    
    # Default model to use
    DEFAULT_MODEL = "gpt-3.5-turbo"
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize the AI service.
        
        Args:
            api_key: Optional OpenAI API key (will use OPENAI_API_KEY from environment if not provided)
            model: Optional model name to use (defaults to gpt-3.5-turbo)
        """
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.model = model or self.DEFAULT_MODEL
        
        if not self.api_key:
            logger.warning("No OpenAI API key provided. Some features may not work.")
        else:
            openai.api_key = self.api_key
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a response using the OpenAI Chat API.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            model: Optional model name to use (overrides the default)
            temperature: Controls randomness (0.0 to 2.0)
            max_tokens: Maximum number of tokens to generate
            **kwargs: Additional parameters to pass to the API
            
        Returns:
            Dictionary containing the generated response and metadata
        """
        if not self.api_key:
            return self._fallback_response(messages)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=model or self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )
            
            return {
                'success': True,
                'response': response.choices[0].message['content'].strip(),
                'model': response.model,
                'usage': dict(response.usage),
                'finish_reason': response.choices[0].finish_reason
            }
            
        except Exception as e:
            error_msg = f"AI API request failed: {str(e)}"
            logger.error(error_msg)
            return self._fallback_response(messages, error=error_msg)
    
    async def evaluate_argument(
        self,
        argument: str,
        scenario: str,
        language: str = 'en',
        tone: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Evaluate the persuasiveness of an argument.
        
        Args:
            argument: The argument to evaluate
            scenario: The scenario/context of the argument
            language: Language of the argument (default: 'en')
            tone: Optional tone of the argument (e.g., 'formal', 'casual')
            model: Optional model name to use (overrides the default)
            **kwargs: Additional parameters to pass to the API
            
        Returns:
            Dictionary containing the evaluation results
        """
        prompt = f"""
        You are an expert in persuasive communication and argument evaluation.
        
        Scenario: {scenario}
        
        Evaluate the following argument in terms of:
        1. Persuasiveness (1-10)
        2. Clarity (1-10)
        3. Relevance to the scenario (1-10)
        4. Emotional appeal (1-10)
        
        Provide a brief explanation for each score.
        
        Argument: "{argument}"
        
        Evaluation (in {language}):
        """.strip()
        
        if tone:
            prompt += f"\n\nTone: {tone}"
        
        messages = [
            {"role": "system", "content": "You are a helpful assistant that evaluates arguments."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.generate_response(
            messages=messages,
            model=model,
            **kwargs
        )
        
        if not response.get('success', False):
            return response
        
        # Parse the response to extract scores
        scores = {
            'persuasiveness': 0,
            'clarity': 0,
            'relevance': 0,
            'emotional_appeal': 0,
            'explanation': ''
        }
        
        # Simple parsing of the response (can be improved)
        lines = response['response'].split('\n')
        for line in lines:
            line_lower = line.lower()
            if 'persuasiveness' in line_lower:
                scores['persuasiveness'] = self._extract_score(line)
            elif 'clarity' in line_lower:
                scores['clarity'] = self._extract_score(line)
            elif 'relevance' in line_lower:
                scores['relevance'] = self._extract_score(line)
            elif 'emotional' in line_lower:
                scores['emotional_appeal'] = self._extract_score(line)
            else:
                scores['explanation'] += line + '\n'
        
        scores['overall_score'] = sum([
            scores['persuasiveness'],
            scores['clarity'],
            scores['relevance'],
            scores['emotional_appeal']
        ]) / 4
        
        scores['is_persuasive'] = scores['overall_score'] >= 7
        
        response['evaluation'] = scores
        return response
    
    def _extract_score(self, text: str) -> int:
        """Extract a score (1-10) from a line of text."""
        import re
        match = re.search(r'(\d+)(?:/10)?', text)
        if match:
            return min(10, max(1, int(match.group(1))))
        return 5  # Default to neutral score if no number found
    
    def _fallback_response(self, messages: List[Dict[str, str]], error: str = None) -> Dict[str, Any]:
        """Generate a fallback response when the API is unavailable."""
        last_message = messages[-1]['content'] if messages else ""
        
        # Simple rule-based fallback
        if 'hello' in last_message.lower() or 'hi' in last_message.lower():
            response = "Hello! How can I help you today?"
        elif '?' in last_message:
            response = "I'm sorry, I'm having trouble processing your request right now. Please try again later."
        else:
            response = "I understand. Please tell me more."
        
        return {
            'success': False,
            'response': response,
            'model': 'fallback',
            'error': error or 'Using fallback response',
            'is_fallback': True
        }


# Singleton instance
ai_service = AIService()
