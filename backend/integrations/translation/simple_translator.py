"""
Simple translation service that uses fallback methods when MarianMT models are not available.
This provides a working translation solution without requiring complex dependencies.
"""

import logging
from typing import Optional
from .fallback_translator import FallbackTranslator

logger = logging.getLogger(__name__)

class SimpleTranslator:
    """
    Simple translation service that prioritizes working translations
    over complex model dependencies.
    """
    
    def __init__(self):
        self.fallback_translator = FallbackTranslator()
        self._marian_available = False
        self._check_marian_availability()
    
    def _check_marian_availability(self):
        """Check if MarianMT models are available without actually loading them."""
        try:
            # Just check if the imports work
            from transformers import MarianMTModel, MarianTokenizer
            self._marian_available = True
            logger.info("MarianMT models are available")
        except ImportError as e:
            logger.warning(f"MarianMT not available: {e}")
            self._marian_available = False
        except Exception as e:
            logger.warning(f"MarianMT models may not work properly: {e}")
            self._marian_available = False
    
    def translate(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Translate text using available methods.
        Prioritizes fallback translator for African languages.
        """
        # Normalize language codes
        src_lang = src_lang.lower()
        tgt_lang = tgt_lang.lower()
        
        # For African languages, use fallback translator
        african_langs = ["twi", "gaa", "ewe"]
        if src_lang in african_langs or tgt_lang in african_langs:
            try:
                result = self.fallback_translator.translate(text, src_lang, tgt_lang)
                if not result.startswith("[Translation not available"):
                    logger.info(f"Fallback translation successful: {text[:30]}... -> {result[:30]}...")
                    return result
            except Exception as e:
                logger.error(f"Fallback translation failed: {e}")
        
        # For other languages, try MarianMT if available
        if self._marian_available:
            try:
                from .marianmt import MarianMTTranslator
                result = MarianMTTranslator.translate(text, src_lang, tgt_lang)
                if not result.startswith("[Translation"):
                    return result
            except Exception as e:
                logger.error(f"MarianMT translation failed: {e}")
        
        # If all else fails, provide helpful error message
        return f"[Translation not available for {src_lang} -> {tgt_lang}. Try common phrases like 'hello', 'thank you', 'good morning']"
    
    def is_supported(self, src_lang: str, tgt_lang: str) -> bool:
        """Check if translation is supported for the given language pair."""
        src_lang = src_lang.lower()
        tgt_lang = tgt_lang.lower()
        
        # Check fallback translator first
        if self.fallback_translator.is_supported(src_lang, tgt_lang):
            return True
        
        # Check MarianMT if available
        if self._marian_available:
            try:
                from .marianmt import MarianMTTranslator
                return MarianMTTranslator.is_supported(src_lang, tgt_lang)
            except:
                pass
        
        return False
    
    def get_supported_languages(self) -> list:
        """Get list of supported language pairs."""
        supported = []
        
        # Add fallback translator languages
        african_langs = ["twi", "gaa", "ewe"]
        for lang in african_langs:
            supported.extend([
                ("en", lang),
                (lang, "en")
            ])
        
        # Add MarianMT languages if available
        if self._marian_available:
            try:
                from .marianmt import MarianMTTranslator
                supported.extend(MarianMTTranslator.get_supported_languages())
            except:
                pass
        
        return list(set(supported))  # Remove duplicates
    
    def get_available_phrases(self, language: str) -> list:
        """Get list of available phrases for a given language."""
        return self.fallback_translator.get_available_phrases(language) 