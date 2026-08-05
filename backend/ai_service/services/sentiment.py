"""
Sentiment Analysis Service - Analyze citizen sentiment in feedback
"""

import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class SentimentService:
    """Service for analyzing sentiment in texts"""
    
    POSITIVE_KEYWORDS = [
        'good', 'excellent', 'great', 'satisfied', 'happy', 'thanks', 'appreciate',
        'wonderful', 'perfect', 'amazing', 'fantastic', 'awesome', 'brilliant',
        'pleased', 'delighted', 'impressed', 'grateful', 'helpful', 'quick'
    ]
    
    NEGATIVE_KEYWORDS = [
        'bad', 'poor', 'disappointed', 'unhappy', 'terrible', 'waste', 'useless',
        'frustrated', 'annoyed', 'angry', 'upset', 'slow', 'broken', 'fail',
        'horrible', 'disgusting', 'useless', 'pathetic', 'shameful'
    ]
    
    NEUTRAL_KEYWORDS = [
        'okay', 'normal', 'average', 'standard', 'adequate', 'acceptable'
    ]
    
    def __init__(self):
        self.sentiment_classifier = None
    
    def load_models(self):
        """Load sentiment analysis model"""
        try:
            from transformers import pipeline
            logger.info("Loading sentiment classifier")
            self.sentiment_classifier = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            logger.info("Sentiment classifier loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load sentiment model: {str(e)}")
            raise
    
    def analyze(self, text: str) -> Dict:
        """
        Analyze sentiment of a single text
        
        Args:
            text: Text to analyze
            
        Returns:
            Dictionary with sentiment analysis
        """
        try:
            if not text or len(text.strip()) == 0:
                return {
                    'sentiment': 'Neutral',
                    'score': 0.0,
                    'confidence': 0.0,
                    'keywords': []
                }
            
            # Method 1: Simple keyword-based analysis (fallback)
            sentiment, score = self._analyze_keywords(text)
            
            # Try to use transformer if available
            if self.sentiment_classifier:
                try:
                    result = self.sentiment_classifier(text[:512])[0]  # Truncate for model
                    # POSITIVE = positive sentiment, NEGATIVE = negative sentiment
                    if result['label'] == 'POSITIVE':
                        transformer_sentiment = 'Positive'
                    else:
                        transformer_sentiment = 'Negative'
                    transformer_score = result['score']
                    
                    # Combine both approaches
                    final_score = (score + transformer_score) / 2
                    final_sentiment = self._determine_overall_sentiment(final_score)
                except:
                    final_sentiment = sentiment
                    final_score = score
            else:
                final_sentiment = sentiment
                final_score = score
            
            # Extract keywords
            keywords = self._extract_keywords(text)
            
            return {
                'sentiment': final_sentiment,
                'score': round(final_score, 3),
                'confidence': 0.7,  # Placeholder
                'keywords': keywords
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return {
                'sentiment': 'Neutral',
                'score': 0.0,
                'confidence': 0.0,
                'keywords': []
            }
    
    def analyze_batch(self, texts: List[str]) -> List[Dict]:
        """Analyze sentiment for multiple texts"""
        results = []
        for text in texts:
            result = self.analyze(text)
            results.append(result)
        return results
    
    def _analyze_keywords(self, text: str) -> tuple:
        """
        Simple keyword-based sentiment analysis
        
        Returns:
            Tuple of (sentiment, score)
        """
        text_lower = text.lower()
        
        positive_count = sum(1 for word in self.POSITIVE_KEYWORDS if word in text_lower)
        negative_count = sum(1 for word in self.NEGATIVE_KEYWORDS if word in text_lower)
        neutral_count = sum(1 for word in self.NEUTRAL_KEYWORDS if word in text_lower)
        
        total = positive_count + negative_count + neutral_count
        
        if total == 0:
            return 'Neutral', 0.0
        
        # Calculate weighted score (-1 to 1)
        score = (positive_count - negative_count) / total
        
        if score > 0.3:
            sentiment = 'Positive'
        elif score < -0.3:
            sentiment = 'Negative'
        else:
            sentiment = 'Neutral'
        
        return sentiment, score
    
    def _determine_overall_sentiment(self, score: float) -> str:
        """Determine sentiment from score (-1 to 1)"""
        if score > 0.3:
            return 'Positive'
        elif score < -0.3:
            return 'Negative'
        else:
            return 'Neutral'
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract sentiment-bearing keywords from text"""
        text_lower = text.lower()
        found_keywords = []
        
        for word in self.POSITIVE_KEYWORDS:
            if word in text_lower:
                found_keywords.append(f"+{word}")
        
        for word in self.NEGATIVE_KEYWORDS:
            if word in text_lower:
                found_keywords.append(f"-{word}")
        
        return found_keywords[:5]  # Return top 5
