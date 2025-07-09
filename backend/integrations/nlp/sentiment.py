from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

class SentimentAnalyzer:
    """
    Integration for VADER sentiment analysis.
    """
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def analyze(self, text: str) -> float:
        """Returns compound sentiment score (-1 to 1)."""
        return self.analyzer.polarity_scores(text)['compound'] 