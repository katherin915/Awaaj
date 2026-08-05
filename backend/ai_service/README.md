# 🤖 Awaaz AI Service

Advanced NLP-based service for intelligent civic complaint processing with automatic categorization, semantic clustering, and smart prioritization.

## 🎯 Features

### 1. **NLP Classification**
- Auto-categorize civic issues into 7 predefined categories
- Zero-shot classification for flexibility
- Multi-language support
- Confidence scoring

### 2. **Semantic Clustering**
- Identify duplicate/similar issues using embeddings
- Merge reports for deduplication
- Cluster quality metrics (Silhouette score)
- Fast similarity search

### 3. **Smart Prioritization**
- Hybrid priority calculation
- Category-based risk assessment
- Location density analysis
- Citizen engagement scoring
- Safety-critical issue detection
- SLA deadline calculation

### 4. **Sentiment Analysis**
- Analyze citizen satisfaction in feedback
- Keyword extraction
- Sentiment-based analytics

## 📋 Categories Supported

1. **Roads & Infrastructure** - Potholes, pavements, sidewalks
2. **Water & Sanitation** - Sewers, drainage, sanitation facilities
3. **Electricity & Power** - Streetlights, power outages
4. **Waste Management** - Garbage collection, littering
5. **Public Amenities** - Parks, benches, facilities
6. **Environment** - Pollution, trees, green spaces
7. **Others** - Miscellaneous issues

## 🚀 Quick Start

### Installation

```bash
# Navigate to AI service directory
cd backend/ai_service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Create `.env` file in `backend/ai_service/`:

```env
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8001
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Run Service

```bash
# Using Python
python main.py

# Or using Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Service will be available at: `http://localhost:8001`

## 📡 API Endpoints

### 1. Classification

**Classify a single issue:**
```bash
POST /api/v1/classify

{
  "text": "Pothole on Main Street causing accidents",
  "title": "Dangerous pothole",
  "language": "en"
}

Response:
{
  "primary_category": "Roads & Infrastructure",
  "confidence": 0.92,
  "secondary_categories": ["Public Amenities"],
  "reasoning": "Classified as 'Roads & Infrastructure' with 92% confidence based on keywords: pothole, street."
}
```

**Batch classification:**
```bash
POST /api/v1/classify-batch

[
  {"text": "...", "title": "..."},
  {"text": "...", "title": "..."}
]
```

### 2. Embeddings

**Get semantic embeddings:**
```bash
POST /api/v1/embed

{
  "texts": [
    "Pothole on Main Street",
    "Road damage in downtown area"
  ]
}

Response:
{
  "embeddings": [[0.1, 0.2, ...], [0.15, 0.25, ...]],
  "model_info": {
    "model": "sentence-transformers/all-MiniLM-L6-v2",
    "dimension": 384,
    "type": "semantic"
  }
}
```

### 3. Clustering

**Cluster similar issues:**
```bash
POST /api/v1/cluster

{
  "issues": [
    {"id": "issue1", "embedding": [...]},
    {"id": "issue2", "embedding": [...]}
  ],
  "similarity_threshold": 0.75
}

Response:
{
  "clusters": [
    {
      "cluster_id": 0,
      "members": [0, 3, 7],
      "size": 3,
      "quality": 0.85
    }
  ],
  "cluster_quality": {
    "total_clusters": 5,
    "total_issues": 20,
    "total_merged": 3,
    "merge_rate": 60.0,
    "avg_cluster_size": 4.0
  }
}
```

### 4. Priority Calculation

**Calculate issue priority:**
```bash
POST /api/v1/prioritize

{
  "issue_id": "issue_123",
  "category": "Roads & Infrastructure",
  "location_density": 75,
  "citizen_upvotes": 12,
  "age_hours": 48,
  "safety_rating": 85
}

Response:
{
  "priority_level": "High",
  "priority_score": 78,
  "factors": {
    "category_risk": 60,
    "location_density": 75,
    "citizen_engagement": 100,
    "age_factor": 38,
    "safety_rating": 85
  },
  "reasoning": "Priority set to High (score: 78/100). - High-risk category: Roads & Infrastructure. - Multiple citizen reports/upvotes. - Safety-critical concern."
}
```

**Batch prioritization:**
```bash
POST /api/v1/prioritize-batch

[
  {"issue_id": "...", "category": "...", ...},
  {"issue_id": "...", "category": "...", ...}
]
```

### 5. Sentiment Analysis

**Analyze sentiment:**
```bash
POST /api/v1/sentiment

{
  "texts": [
    "Great service! Issue was resolved quickly.",
    "Very disappointed with the slow response."
  ]
}

Response:
{
  "sentiments": [
    {
      "sentiment": "Positive",
      "score": 0.78,
      "confidence": 0.7,
      "keywords": ["+great", "+quick"]
    },
    {
      "sentiment": "Negative",
      "score": -0.82,
      "confidence": 0.7,
      "keywords": ["-disappointed", "-slow"]
    }
  ]
}
```

### 6. Utility Endpoints

**Get supported categories:**
```bash
GET /api/v1/categories

Response:
{
  "categories": [
    "Roads & Infrastructure",
    "Water & Sanitation",
    ...
  ]
}
```

**Get model information:**
```bash
GET /api/v1/models

Response:
{
  "classification_model": "facebook/bart-large-mnli",
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dimension": 384,
  "language": "multilingual"
}
```

**Health check:**
```bash
GET /health

Response:
{
  "status": "healthy",
  "service": "Awaaz AI Service",
  "version": "1.0.0"
}
```

## 🔧 Configuration

### Models Used

| Component | Model | Dimension | Usage |
|-----------|-------|-----------|-------|
| Classification | facebook/bart-large-mnli | - | Zero-shot classification |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 | 384 | Semantic similarity |
| Sentiment | distilbert-base-uncased-finetuned-sst-2 | - | Sentiment analysis |

### Performance Tuning

```env
# Model loading
DEVICE=cuda  # Use GPU if available
CACHE_DIR=/path/to/model/cache

# API performance
MAX_WORKERS=4
BATCH_SIZE=32

# Clustering
SIMILARITY_THRESHOLD=0.75
MIN_CLUSTER_SIZE=2
```

## 📊 Priority Calculation Algorithm

```
Priority Score = 
  35% × Category Risk +
  25% × Location Density +
  20% × Citizen Engagement +
  10% × Age Factor +
  10% × Safety Rating

Decision Rules:
- Score ≥ 70 → High Priority
- 40 ≤ Score < 70 → Medium Priority
- Score < 40 → Low Priority
```

### SLA Targets

| Priority | Target Time |
|----------|------------|
| High | 24 hours |
| Medium | 72 hours |
| Low | 168 hours (1 week) |

## 🔗 Integration with Node.js Backend

### API Gateway Integration

In `backend/server.js`:

```javascript
const axios = require('axios');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Classification middleware
async function classifyIssue(req, res, next) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/classify`, {
      text: req.body.description,
      title: req.body.title,
      language: req.body.language || 'en'
    });
    
    req.body.category = response.data.primary_category;
    req.body.categoryConfidence = response.data.confidence;
    next();
  } catch (error) {
    console.error('Classification error:', error);
    next();
  }
}

// Prioritization middleware
async function prioritizeIssue(req, res, next) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/v1/prioritize`, {
      issue_id: req.body.id,
      category: req.body.category,
      location_density: calculateLocationDensity(req.body.location),
      citizen_upvotes: req.body.upvotes || 0,
      age_hours: calculateAgeHours(req.body.createdAt),
      safety_rating: req.body.safetyRating || 50
    });
    
    req.body.priority = response.data.priority_level;
    req.body.priorityScore = response.data.priority_score;
    next();
  } catch (error) {
    console.error('Prioritization error:', error);
    next();
  }
}

app.post('/api/issues', classifyIssue, prioritizeIssue, createIssue);
```

## 📈 Performance Metrics

- **Classification latency**: ~100ms per issue
- **Embedding generation**: ~50ms for 10 texts
- **Clustering**: ~500ms for 1000 issues
- **Priority calculation**: ~10ms per issue
- **Memory usage**: ~2-3GB (varies with model)

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=services

# Specific test
pytest tests/test_classifier.py -v
```

## 📚 API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🐛 Error Handling

All errors return standardized format:

```json
{
  "error": "Error message",
  "status_code": 400
}
```

Common status codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `500` - Server error

## 📦 Deployment

### Docker

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### Docker Compose Integration

```yaml
services:
  ai_service:
    build: ./backend/ai_service
    ports:
      - "8001:8001"
    environment:
      AI_SERVICE_HOST: 0.0.0.0
      AI_SERVICE_PORT: 8001
    networks:
      - civix-network
```

## 🔐 Security Considerations

- Input validation on all endpoints
- Rate limiting recommended
- Model inference timeouts
- API authentication (implement in production)
- Data sanitization for NLP models

## 📞 Support & Issues

For issues or questions:
1. Check API documentation at `/docs`
2. Review logs in console output
3. Check GitHub issues
4. Create a detailed issue report

## 📄 License

MIT License - Same as main Civix project

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained By**: Civix Team

