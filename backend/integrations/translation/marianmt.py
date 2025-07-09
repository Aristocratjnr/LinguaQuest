from transformers import MarianMTModel, MarianTokenizer
from typing import Tuple

class MarianMTTranslator:
    """
    Integration for HuggingFace MarianMT translation models.
    Supports English <-> Twi, Ga, Ewe.
    """
    MODEL_NAMES = {
        ("en", "twi"): "Helsinki-NLP/opus-mt-en-tw",
        ("twi", "en"): "Helsinki-NLP/opus-mt-tw-en",
        ("en", "gaa"): "Helsinki-NLP/opus-mt-en-gaa",
        ("gaa", "en"): "Helsinki-NLP/opus-mt-gaa-en",
        ("en", "ewe"): "Helsinki-NLP/opus-mt-en-ewe",
        ("ewe", "en"): "Helsinki-NLP/opus-mt-ewe-en",
    }
    _cache = {}

    @classmethod
    def get_model_and_tokenizer(cls, src_lang: str, tgt_lang: str) -> Tuple[MarianTokenizer, MarianMTModel]:
        key = (src_lang.lower(), tgt_lang.lower())
        model_name = cls.MODEL_NAMES.get(key)
        if not model_name:
            raise ValueError(f"Translation for {src_lang} -> {tgt_lang} not supported.")
        if key not in cls._cache:
            tokenizer = MarianTokenizer.from_pretrained(model_name)
            model = MarianMTModel.from_pretrained(model_name)
            cls._cache[key] = (tokenizer, model)
        return cls._cache[key]

    @classmethod
    def translate(cls, text: str, src_lang: str, tgt_lang: str) -> str:
        tokenizer, model = cls.get_model_and_tokenizer(src_lang, tgt_lang)
        batch = tokenizer([text], return_tensors="pt", padding=True)
        input_ids = batch["input_ids"]
        attention_mask = batch.get("attention_mask", None)
        if attention_mask is not None:
            gen = model.generate(input_ids=input_ids, attention_mask=attention_mask)
        else:
            gen = model.generate(input_ids=input_ids)
        return tokenizer.decode(gen[0], skip_special_tokens=True) 