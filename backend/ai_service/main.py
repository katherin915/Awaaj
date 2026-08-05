"""
Awaaz AI Service - NLP Classification, Semantic Clustering, and Prioritization
FastAPI-based service for intelligent complaint processing
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv
import logging

from services.classifier import ClassificationService
from services.clustering import ClusteringService
from services.priority import PriorityService
from services.sentiment import SentimentService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Awaaz AI Service",
    description="NLP Classification, Clustering, and Prioritization Service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
classifier = ClassificationService()
clustering = ClusteringService()
priority = PriorityService()
sentiment = SentimentService()

# ============================================
# MODELS
# ============================================

class ClassificationRequest(BaseModel):
    """Request for text classification"""
    text: str
    title: str
    language: str = "en"

class ClassificationResponse(BaseModel):
    """Response from classifier"""
    primary_category: str
    confidence: float
    secondary_categories: List[str]
    reasoning: str

class ClusteringRequest(BaseModel):
    """Request for clustering"""
    issues: List[Dict] = None  # List of issue dicts with 'id' and 'embedding'
    embeddings: List[List[float]] = None  # Pre-computed embeddings
    similarity_threshold: float = 0.75

class ClusteringResponse(BaseModel):
    """Clustering response"""
    clusters: List[Dict]
    cluster_quality: Dict
    total_issues: int
    cluster_count: int

class PriorityRequest(BaseModel):
    """Request for priority calculation"""
    issue_id: str
    category: str
    location_density: float  # 0-100
    citizen_upvotes: int
    age_hours: int
    safety_rating: float  # 0-100

class PriorityResponse(BaseModel):
    """Priority response"""
    priority_level: str  # High, Medium, Low
    priority_score: int  # 0-100
    factors: Dict
    reasoning: str

class EmbeddingRequest(BaseModel):
    """Request for text embeddings"""
    texts: List[str]

class EmbeddingResponse(BaseModel):
    """Embedding response"""
    embeddings: List[List[float]]
    model_info: Dict

# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Service health check"""
    return {
        "status": "healthy",
        "service": "Awaaz AI Service",
        "version": "1.0.0"
    }

# ============================================
# CLASSIFICATION ENDPOINTS
# ============================================

@app.post("/api/v1/classify", response_model=ClassificationResponse)
async def classify_issue(request: ClassificationRequest):
    """
    Classify a civic issue into categories
    
    Categories:
    - Roads & Infrastructure
    - Water & Sanitation
    - Electricity & Power
    - Waste Management
    - Public Amenities
    - Environment
    - Others
    """
    try:
        result = classifier.classify(
            text=request.text,
            title=request.title,
            language=request.language
        )
        
        logger.info(f"Classified issue: {result['primary_category']}")
        
        return ClassificationResponse(
            primary_category=result['primary_category'],
            confidence=result['confidence'],
            secondary_categories=result['secondary_categories'],
            reasoning=result['reasoning']
        )
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/classify-batch")
async def classify_batch(requests: List[ClassificationRequest]):
    """Batch classification of multiple issues"""
    try:
        results = []
        for req in requests:
            result = classifier.classify(
                text=req.text,
                title=req.title,
                language=req.language
            )
            results.append(result)
        
        return {"classifications": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Batch classification error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# EMBEDDING ENDPOINTS
# ============================================

@app.post("/api/v1/embed", response_model=EmbeddingResponse)
async def get_embeddings(request: EmbeddingRequest):
    """
    Get semantic embeddings for texts
    Uses Sentence-BERT for semantic similarity
    """
    try:
        embeddings = clustering.get_embeddings(request.texts)
        
        return EmbeddingResponse(
            embeddings=embeddings,
            model_info={
                "model": "sentence-transformers/all-MiniLM-L6-v2",
                "dimension": 384,
                "type": "semantic"
            }
        )
    except Exception as e:
        logger.error(f"Embedding error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# CLUSTERING ENDPOINTS
# ============================================

@app.post("/api/v1/cluster", response_model=ClusteringResponse)
async def cluster_issues(request: ClusteringRequest):
    """
    Cluster similar issues together to identify duplicates
    Uses semantic similarity for intelligent deduplication
    """
    try:
        if request.issues:
            # Extract embeddings from issues if available
            embeddings = [issue.get('embedding') for issue in request.issues]
            if not all(embeddings):
                # Compute embeddings if not provided
                texts = [issue.get('text', '') for issue in request.issues]
                embeddings = clustering.get_embeddings(texts)
        else:
            embeddings = request.embeddings
        
        clusters = clustering.cluster_issues(
            embeddings=embeddings,
            similarity_threshold=request.similarity_threshold
        )
        
        logger.info(f"Created {len(clusters)} clusters")
        
        return ClusteringResponse(
            clusters=clusters,
            cluster_quality=clustering.get_cluster_quality(clusters),
            total_issues=len(embeddings),
            cluster_count=len(clusters)
        )
    except Exception as e:
        logger.error(f"Clustering error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# PRIORITY ENDPOINTS
# ============================================

@app.post("/api/v1/prioritize", response_model=PriorityResponse)
async def calculate_priority(request: PriorityRequest):
    """
    Calculate issue priority using hybrid approach
    Combines category risk, location density, citizen engagement, and SLA age
    """
    try:
        result = priority.calculate_priority(
            issue_id=request.issue_id,
            category=request.category,
            location_density=request.location_density,
            citizen_upvotes=request.citizen_upvotes,
            age_hours=request.age_hours,
            safety_rating=request.safety_rating
        )
        
        logger.info(f"Priority calculated: {result['priority_level']} ({result['priority_score']})")
        
        return PriorityResponse(
            priority_level=result['priority_level'],
            priority_score=result['priority_score'],
            factors=result['factors'],
            reasoning=result['reasoning']
        )
    except Exception as e:
        logger.error(f"Priority calculation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/prioritize-batch")
async def prioritize_batch(requests: List[PriorityRequest]):
    """Batch priority calculation"""
    try:
        results = []
        for req in requests:
            result = priority.calculate_priority(
                issue_id=req.issue_id,
                category=req.category,
                location_density=req.location_density,
                citizen_upvotes=req.citizen_upvotes,
                age_hours=req.age_hours,
                safety_rating=req.safety_rating
            )
            results.append(result)
        
        return {"priorities": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Batch priority error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# SENTIMENT ANALYSIS ENDPOINTS
# ============================================

@app.post("/api/v1/sentiment")
async def analyze_sentiment(texts: List[str]):
    """Analyze sentiment of texts"""
    try:
        results = sentiment.analyze_batch(texts)
        return {"sentiments": results}
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================
# UTILITY ENDPOINTS
# ============================================

@app.get("/api/v1/categories")
async def get_categories():
    """Get list of supported categories"""
    return {
        "categories": [
            "Roads & Infrastructure",
            "Water & Sanitation",
            "Electricity & Power",
            "Waste Management",
            "Public Amenities",
            "Environment",
            "Others"
        ]
    }

@app.get("/api/v1/models")
async def get_model_info():
    """Get information about loaded models"""
    return {
        "classification_model": classifier.model_name,
        "embedding_model": clustering.model_name,
        "embedding_dimension": 384,
        "language": "multilingual"
    }

# ============================================
# ERROR HANDLERS
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

# ============================================
# STARTUP & SHUTDOWN
# ============================================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Awaaz AI Service...")
    logger.info("Loading NLP models...")
    classifier.load_models()
    clustering.load_models()
    logger.info("AI Service ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Awaaz AI Service...")

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("AI_SERVICE_PORT", 8001))
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
