"""
Fallback translation service for when MarianMT models are not available.
Provides alternative translation methods and helpful error messages.
"""

import re
from typing import Dict, List

class FallbackTranslator:
    """
    Fallback translation service that provides alternative methods
    when MarianMT models are not available for African languages.
    """
    
    # Simple dictionary-based translations for common phrases
    COMMON_PHRASES = {
        "twi": {
            "hello": "Mema wo akwaaba",
            "good morning": "Maakye",
            "good afternoon": "Maaha",
            "good evening": "Maadwo",
            "thank you": "Meda wo ase",
            "please": "Yɛ",
            "yes": "Aane",
            "no": "Daabi",
            "how are you": "Wo ho te sɛn?",
            "i am fine": "Me ho yɛ",
            "goodbye": "Nante yie",
            "welcome": "Mema wo akwaaba",
            "excuse me": "Kafra",
            "sorry": "Kafra",
            "i understand": "Me te ase",
            "i don't understand": "Mente ase",
            "speak slowly": "Ka kakra",
            "repeat": "San ka bio",
            "what is your name": "Wo din de sɛn?",
            "my name is": "Me din de",
        },
        "gaa": {
            "hello": "Mile gbɛ",
            "good morning": "Mile gbɛ",
            "good afternoon": "Mile gbɛ",
            "good evening": "Mile gbɛ",
            "thank you": "Oyiwaadɛ",
            "please": "Yɛ",
            "yes": "Ee",
            "no": "Dabi",
            "how are you": "Wo hee?",
            "i am fine": "Me hee",
            "goodbye": "Nante yie",
            "welcome": "Mile gbɛ",
            "excuse me": "Kafra",
            "sorry": "Kafra",
            "i understand": "Me te ase",
            "i don't understand": "Mente ase",
            "speak slowly": "Ka kakra",
            "repeat": "San ka bio",
            "what is your name": "Wo din de sɛn?",
            "my name is": "Me din de",
        },
        "ewe": {
            "hello": "Miawoe",
            "good morning": "Miawoe",
            "good afternoon": "Miawoe",
            "good evening": "Miawoe",
            "thank you": "Akpe",
            "please": "Yɛ",
            "yes": "Ee",
            "no": "Amede",
            "how are you": "Efɔa?",
            "i am fine": "Efɔa",
            "goodbye": "Nante yie",
            "welcome": "Miawoe",
            "excuse me": "Kafra",
            "sorry": "Kafra",
            "i understand": "Me te ase",
            "i don't understand": "Mente ase",
            "speak slowly": "Ka kakra",
            "repeat": "San ka bio",
            "what is your name": "Wo din de sɛn?",
            "my name is": "Me din de",
        }
    }
    
    @classmethod
    def translate(cls, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Provide fallback translation when MarianMT models are not available.
        """
        if src_lang.lower() == "en" and tgt_lang.lower() in ["twi", "gaa", "ewe"]:
            return cls._translate_to_african_language(text, tgt_lang.lower())
        elif tgt_lang.lower() == "en" and src_lang.lower() in ["twi", "gaa", "ewe"]:
            return cls._translate_from_african_language(text, src_lang.lower())
        else:
            return f"[Translation not available for {src_lang} -> {tgt_lang}]"
    
    @classmethod
    def _translate_to_african_language(cls, text: str, target_lang: str) -> str:
        """
        Translate English text to African language using dictionary lookup.
        """
        if target_lang not in cls.COMMON_PHRASES:
            return f"[Translation not available for English -> {target_lang}]"
        
        # Convert to lowercase for matching
        text_lower = text.lower().strip()
        
        # Try exact match first
        if text_lower in cls.COMMON_PHRASES[target_lang]:
            return cls.COMMON_PHRASES[target_lang][text_lower]
        
        # Try partial matches
        for english_phrase, translation in cls.COMMON_PHRASES[target_lang].items():
            if english_phrase in text_lower:
                return translation
        
        # If no match found, provide helpful message
        return f"[Translation not available for: '{text}' -> {target_lang}]"
    
    @classmethod
    def _translate_from_african_language(cls, text: str, source_lang: str) -> str:
        """
        Translate African language text to English using reverse dictionary lookup.
        """
        if source_lang not in cls.COMMON_PHRASES:
            return f"[Translation not available for {source_lang} -> English]"
        
        # Create reverse mapping
        reverse_dict = {v.lower(): k for k, v in cls.COMMON_PHRASES[source_lang].items()}
        
        # Convert to lowercase for matching
        text_lower = text.lower().strip()
        
        # Try exact match first
        if text_lower in reverse_dict:
            return reverse_dict[text_lower]
        
        # Try partial matches
        for african_phrase, english_phrase in reverse_dict.items():
            if african_phrase in text_lower:
                return english_phrase
        
        # If no match found, provide helpful message
        return f"[Translation not available for: '{text}' ({source_lang} -> English)]"
    
    @classmethod
    def get_available_phrases(cls, language: str) -> List[str]:
        """Get list of available phrases for a given language."""
        if language.lower() in cls.COMMON_PHRASES:
            return list(cls.COMMON_PHRASES[language.lower()].keys())
        return []
    
    @classmethod
    def is_supported(cls, src_lang: str, tgt_lang: str) -> bool:
        """Check if fallback translation is supported for the given language pair."""
        supported_langs = ["twi", "gaa", "ewe"]
        return (src_lang.lower() == "en" and tgt_lang.lower() in supported_langs) or \
               (tgt_lang.lower() == "en" and src_lang.lower() in supported_langs) 