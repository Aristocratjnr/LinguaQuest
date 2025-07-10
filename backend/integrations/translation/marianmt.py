from transformers import MarianMTModel, MarianTokenizer
from typing import Tuple
import logging
from .fallback_translator import FallbackTranslator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarianMTTranslator:
    """
    Integration for HuggingFace MarianMT translation models.
    Supports English <-> Twi, Ga, Ewe with fallback options.
    """
    MODEL_NAMES = {
        # Primary models (may not exist for all African languages)
        ("en", "twi"): "Helsinki-NLP/opus-mt-en-tw",
        ("twi", "en"): "Helsinki-NLP/opus-mt-tw-en",
        ("en", "gaa"): "Helsinki-NLP/opus-mt-en-gaa", 
        ("gaa", "en"): "Helsinki-NLP/opus-mt-gaa-en",
        ("en", "ewe"): "Helsinki-NLP/opus-mt-en-ewe",
        ("ewe", "en"): "Helsinki-NLP/opus-mt-ewe-en",
        
        # Fallback models (more commonly available)
        ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
        ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
        ("en", "es"): "Helsinki-NLP/opus-mt-en-es", 
        ("es", "en"): "Helsinki-NLP/opus-mt-es-en",
        ("en", "de"): "Helsinki-NLP/opus-mt-en-de",
        ("de", "en"): "Helsinki-NLP/opus-mt-de-en",
    }
    _cache = {}

    @classmethod
    def get_model_and_tokenizer(cls, src_lang: str, tgt_lang: str) -> Tuple[MarianTokenizer, MarianMTModel]:
        key = (src_lang.lower(), tgt_lang.lower())
        model_name = cls.MODEL_NAMES.get(key)
        
        if not model_name:
            raise ValueError(f"Translation for {src_lang} -> {tgt_lang} not supported.")
        
        if key not in cls._cache:
            try:
                logger.info(f"Loading model: {model_name}")
                tokenizer = MarianTokenizer.from_pretrained(model_name)
                model = MarianMTModel.from_pretrained(model_name)
                cls._cache[key] = (tokenizer, model)
                logger.info(f"Successfully loaded model: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {str(e)}")
                raise ValueError(f"Model {model_name} could not be loaded: {str(e)}")
        
        return cls._cache[key]

    @classmethod
    def translate(cls, text: str, src_lang: str, tgt_lang: str) -> str:
        """
        Translate text from source language to target language.
        Returns the translated text or a fallback message if translation fails.
        """
        try:
            tokenizer, model = cls.get_model_and_tokenizer(src_lang, tgt_lang)
            batch = tokenizer([text], return_tensors="pt", padding=True)
            input_ids = batch["input_ids"]
            attention_mask = batch.get("attention_mask", None)
            
            if attention_mask is not None:
                gen = model.generate(input_ids=input_ids, attention_mask=attention_mask)
            else:
                gen = model.generate(input_ids=input_ids)
            
            translated = tokenizer.decode(gen[0], skip_special_tokens=True)
            logger.info(f"Successfully translated: {text[:50]}... -> {translated[:50]}...")
            return translated
            
        except Exception as e:
            logger.error(f"Translation error for {src_lang} -> {tgt_lang}: {str(e)}")
            
            # Try fallback translator for African languages
            if FallbackTranslator.is_supported(src_lang, tgt_lang):
                logger.info(f"Trying fallback translator for {src_lang} -> {tgt_lang}")
                try:
                    fallback_result = FallbackTranslator.translate(text, src_lang, tgt_lang)
                    if not fallback_result.startswith("[Translation not available"):
                        logger.info(f"Fallback translation successful: {fallback_result}")
                        return fallback_result
                except Exception as fallback_error:
                    logger.error(f"Fallback translation also failed: {str(fallback_error)}")
            
            # Provide helpful error message based on the issue
            if "not supported" in str(e):
                return f"[Translation not available for {src_lang} -> {tgt_lang}]"
            elif "could not be loaded" in str(e):
                return f"[Translation model unavailable for {src_lang} -> {tgt_lang}]"
            else:
                return f"[Translation failed: {str(e)}]"

    @classmethod
    def is_supported(cls, src_lang: str, tgt_lang: str) -> bool:
        """Check if translation is supported for the given language pair."""
        key = (src_lang.lower(), tgt_lang.lower())
        return key in cls.MODEL_NAMES

    @classmethod
    def get_supported_languages(cls) -> list:
        """Get list of supported language pairs."""
        return list(cls.MODEL_NAMES.keys()) 