import os
import requests
from typing import Optional, Dict, Any
import logging
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class TranslationService:
    """
    A service for handling translations using the LibreTranslate API.
    """
    
    # LibreTranslate API endpoints (public instance)
    BASE_URL = "https://libretranslate.de"
    TRANSLATE_ENDPOINT = f"{BASE_URL}/translate"
    LANGUAGES_ENDPOINT = f"{BASE_URL}/languages"
    
    # Language code mapping for African languages
    LANGUAGE_MAPPING = {
        'twi': 'ak',  # Twi (Akan)
        'gaa': 'gaa', # Ga
        'ewe': 'ee',  # Ewe
        'en': 'en',   # English
        'fr': 'fr',   # French
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the translation service.
        
        Args:
            api_key: Optional API key for LibreTranslate (if using a private instance)
        """
        self.api_key = api_key or os.getenv('LIBRETRANSLATE_API_KEY')
        self.supported_languages = self._fetch_supported_languages()
    
    def _fetch_supported_languages(self) -> Dict[str, str]:
        """
        Fetch the list of supported languages from the LibreTranslate API.
        
        Returns:
            Dict mapping language codes to language names
        """
        try:
            response = requests.get(self.LANGUAGES_ENDPOINT)
            response.raise_for_status()
            languages = response.json()
            return {lang['code']: lang['name'] for lang in languages}
        except Exception as e:
            logger.error(f"Failed to fetch supported languages: {e}")
            # Return a default set of languages if the API is unavailable
            return {
                'en': 'English',
                'fr': 'French',
                'es': 'Spanish',
                'de': 'German',
                'it': 'Italian',
                'pt': 'Portuguese',
                'ru': 'Russian',
                'zh': 'Chinese',
                'ja': 'Japanese',
                'ko': 'Korean',
                'ak': 'Akan',  # Twi
                'gaa': 'Ga',   # Ga
                'ee': 'Ewe',   # Ewe
            }
    
    def translate(
        self, 
        text: str, 
        source_lang: str, 
        target_lang: str,
        format: str = 'text',
        api_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Translate text from source language to target language.
        
        Args:
            text: The text to translate
            source_lang: Source language code (e.g., 'en', 'fr', 'es')
            target_lang: Target language code (e.g., 'es', 'fr', 'en')
            format: Format of the input text ('text' or 'html')
            api_url: Optional custom API URL (for private instances)
            
        Returns:
            Dictionary containing the translation result or error information
        """
        # Map internal language codes to LibreTranslate codes
        source_lang = self.LANGUAGE_MAPPING.get(source_lang.lower(), source_lang)
        target_lang = self.LANGUAGE_MAPPING.get(target_lang.lower(), target_lang)
        
        # Validate languages
        if source_lang not in self.supported_languages:
            return {
                'success': False,
                'error': f'Source language {source_lang} is not supported',
                'supported_languages': list(self.supported_languages.keys())
            }
            
        if target_lang not in self.supported_languages:
            return {
                'success': False,
                'error': f'Target language {target_lang} is not supported',
                'supported_languages': list(self.supported_languages.keys())
            }
        
        # Prepare the request payload
        payload = {
            'q': text,
            'source': source_lang,
            'target': target_lang,
            'format': format,
        }
        
        # Add API key if available
        if self.api_key:
            payload['api_key'] = self.api_key
        
        # Use custom API URL if provided, otherwise use the default
        url = api_url or self.TRANSLATE_ENDPOINT
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            return {
                'success': True,
                'translated_text': result.get('translatedText', ''),
                'source_language': source_lang,
                'target_language': target_lang,
                'detected_language': result.get('detectedLanguage', {}).get('language', source_lang),
                'confidence': result.get('detectedLanguage', {}).get('confidence', 1.0)
            }
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Translation API request failed: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'status_code': getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
            }
        except Exception as e:
            error_msg = f"Translation failed: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """
        Detect the language of the given text.
        
        Args:
            text: The text to detect the language of
            
        Returns:
            Dictionary containing the detected language information
        """
        if not text.strip():
            return {
                'success': False,
                'error': 'No text provided for language detection'
            }
        
        # Try to translate to the same language to detect it
        result = self.translate(text, 'auto', 'en')
        
        if not result['success']:
            return result
        
        return {
            'success': True,
            'language': result.get('detected_language', 'en'),
            'confidence': result.get('confidence', 1.0),
            'reliable': result.get('confidence', 0) > 0.8
        }


# Singleton instance
translation_service = TranslationService()
