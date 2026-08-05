"""
NLP Classification Service - Categorize civic issues
"""

import logging
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

logger = logging.getLogger(__name__)

class ClassificationService:
    """Service for classifying civic issues into categories"""
    
    CATEGORIES = [
        "Roads & Infrastructure",
        "Water & Sanitation",
        "Electricity & Power",
        "Waste Management",
        "Public Amenities",
        "Environment",
        "Others"
    ]
    
    def __init__(self):
        self.model_name = "distilbert-base-uncased-finetuned-sst-2-english"
        self.classifier = None
        self.zero_shot_classifier = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_models(self):
        """Load pre-trained models"""
        try:
            logger.info(f"Loading classifier on device: {self.device}")
            
            # For zero-shot classification (more flexible)
            self.zero_shot_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if self.device == "cuda" else -1
            )
            
            logger.info("Classification models loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            raise
    
    def classify(self, text: str, title: str = "", language: str = "en") -> dict:
        """
        Classify issue text into one of the predefined categories
        
        Args:
            text: Issue description
            title: Issue title
            language: Language code
            
        Returns:
            Dictionary with classification results
        """
        try:
            # Combine title and text for better classification
            combined_text = f"{title}. {text}" if title else text
            
            if not self.zero_shot_classifier:
                self.load_models()
            
            # Use zero-shot classification for flexibility
            result = self.zero_shot_classifier(
                combined_text,
                self.CATEGORIES,
                multi_class=False
            )
            
            # Extract results
            primary_category = result['labels'][0]
            confidence = float(result['scores'][0])
            
            # Get secondary categories
            secondary_categories = [
                label for label, score in zip(result['labels'][1:4], result['scores'][1:4])
                if score > 0.1
            ]
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                combined_text,
                primary_category,
                confidence
            )
            
            return {
                'primary_category': primary_category,
                'confidence': confidence,
                'secondary_categories': secondary_categories,
                'reasoning': reasoning
            }
            
        except Exception as e:
            logger.error(f"Classification error: {str(e)}")
            # Fallback to "Others" if classification fails
            return {
                'primary_category': 'Others',
                'confidence': 0.0,
                'secondary_categories': [],
                'reasoning': f"Classification failed: {str(e)}"
            }
    
    def _generate_reasoning(self, text: str, category: str, confidence: float) -> str:
        """Generate human-readable reasoning for classification"""
        
        # Keywords for each category
        keywords = {
            "Roads & Infrastructure": ["road", "pothole", "pavement", "street", "sidewalk", "asphalt", "crack"],
            "Water & Sanitation": ["water", "sewer", "drainage", "sanitation", "leak", "pipe", "flood"],
            "Electricity & Power": ["light", "electricity", "power", "electric", "streetlight", "outage"],
            "Waste Management": ["garbage", "waste", "trash", "litter", "garbage", "dumping", "cleanup"],
            "Public Amenities": ["park", "bench", "playground", "facility", "amenity", "public"],
            "Environment": ["tree", "pollution", "environment", "green", "air quality", "noise", "dust"],
            "Others": []
        }
        
        # Find matching keywords in text
        text_lower = text.lower()
        matching_keywords = []
        
        if category in keywords:
            for keyword in keywords[category]:
                if keyword in text_lower:
                    matching_keywords.append(keyword)
        
        if matching_keywords:
            keyword_text = f" based on keywords: {', '.join(matching_keywords)}"
        else:
            keyword_text = ""
        
        confidence_pct = int(confidence * 100)
        
        return f"Classified as '{category}' with {confidence_pct}% confidence{keyword_text}."
    
    def batch_classify(self, texts: list) -> list:
        """Classify multiple texts at once"""
        results = []
        for text in texts:
            result = self.classify(text)
            results.append(result)
        return results
