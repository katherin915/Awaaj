"""
Priority Calculation Service - Determine issue priority and urgency
"""

import logging
from typing import Dict

logger = logging.getLogger(__name__)

class PriorityService:
    """Service for calculating issue priority"""
    
    # Category risk weights (0-100)
    CATEGORY_RISK_MAP = {
        "Roads & Infrastructure": 60,
        "Water & Sanitation": 80,
        "Electricity & Power": 90,
        "Waste Management": 50,
        "Public Amenities": 40,
        "Environment": 70,
        "Others": 30
    }
    
    # SLA targets (hours)
    SLA_TARGETS = {
        "High": 24,
        "Medium": 72,
        "Low": 168
    }
    
    def __init__(self):
        pass
    
    def calculate_priority(
        self,
        issue_id: str,
        category: str,
        location_density: float,  # 0-100
        citizen_upvotes: int,
        age_hours: int,
        safety_rating: float     # 0-100
    ) -> Dict:
        """
        Calculate priority using hybrid approach
        
        Args:
            issue_id: Unique issue identifier
            category: Issue category
            location_density: Complaint density in this area (0-100)
            citizen_upvotes: Number of citizen upvotes
            age_hours: How old the issue is in hours
            safety_rating: Safety concern level (0-100)
            
        Returns:
            Dictionary with priority level and score
        """
        try:
            # Initialize factors
            factors = {}
            
            # 1. Category Risk (35% weight)
            category_risk = self.CATEGORY_RISK_MAP.get(category, 30)
            factors['category_risk'] = category_risk
            
            # 2. Location Density (25% weight)
            # High density means many people affected
            location_factor = min(100, location_density * 1.2)
            factors['location_density'] = location_factor
            
            # 3. Citizen Engagement (20% weight)
            # Cap at 100, each upvote = 10 points
            engagement_factor = min(100, citizen_upvotes * 10)
            factors['citizen_engagement'] = engagement_factor
            
            # 4. Age Factor (10% weight)
            # Older issues should get higher priority
            age_factor = min(100, (age_hours / 24) * 5)  # 5 points per day
            factors['age_factor'] = age_factor
            
            # 5. Safety Rating (10% weight)
            safety_factor = safety_rating
            factors['safety_rating'] = safety_factor
            
            # Calculate weighted priority score
            weights = {
                'category_risk': 0.35,
                'location_density': 0.25,
                'citizen_engagement': 0.20,
                'age_factor': 0.10,
                'safety_rating': 0.10
            }
            
            priority_score = int(
                factors['category_risk'] * weights['category_risk'] +
                factors['location_density'] * weights['location_density'] +
                factors['citizen_engagement'] * weights['citizen_engagement'] +
                factors['age_factor'] * weights['age_factor'] +
                factors['safety_rating'] * weights['safety_rating']
            )
            
            # Determine priority level
            if priority_score >= 70:
                priority_level = "High"
            elif priority_score >= 40:
                priority_level = "Medium"
            else:
                priority_level = "Low"
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                priority_level,
                priority_score,
                factors,
                category
            )
            
            return {
                'priority_level': priority_level,
                'priority_score': priority_score,
                'factors': factors,
                'reasoning': reasoning
            }
            
        except Exception as e:
            logger.error(f"Priority calculation error: {str(e)}")
            return {
                'priority_level': 'Medium',
                'priority_score': 50,
                'factors': {},
                'reasoning': f'Error in priority calculation: {str(e)}'
            }
    
    def _generate_reasoning(
        self,
        priority_level: str,
        priority_score: int,
        factors: Dict,
        category: str
    ) -> str:
        """Generate human-readable reasoning for priority"""
        
        reasoning_parts = [f"Priority set to {priority_level} (score: {priority_score}/100)"]
        
        # Add factor-based reasoning
        if factors.get('category_risk', 0) >= 70:
            reasoning_parts.append(f"- High-risk category: {category}")
        
        if factors.get('location_density', 0) >= 60:
            reasoning_parts.append("- High complaint density in this area")
        
        if factors.get('citizen_engagement', 0) >= 50:
            reasoning_parts.append("- Multiple citizen reports/upvotes")
        
        if factors.get('age_factor', 0) >= 50:
            reasoning_parts.append("- Issue persisting for extended period")
        
        if factors.get('safety_rating', 0) >= 70:
            reasoning_parts.append("- Safety-critical concern")
        
        return ". ".join(reasoning_parts) + "."
    
    def get_sla_deadline(self, priority_level: str, created_at) -> Dict:
        """
        Calculate SLA deadline based on priority
        
        Args:
            priority_level: High, Medium, or Low
            created_at: Issue creation timestamp
            
        Returns:
            Dictionary with deadline and SLA info
        """
        from datetime import datetime, timedelta
        
        sla_hours = self.SLA_TARGETS.get(priority_level, 72)
        deadline = created_at + timedelta(hours=sla_hours)
        
        return {
            'sla_hours': sla_hours,
            'deadline': deadline.isoformat(),
            'priority': priority_level
        }
