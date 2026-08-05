# AI Service Integration Guide

Complete guide for integrating the Python AI service with the Node.js/Express backend.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Client Helper](#api-client-helper)
3. [Middleware Integration](#middleware-integration)
4. [Route Integration](#route-integration)
5. [Error Handling](#error-handling)
6. [Testing](#testing)

---

## Environment Setup

### 1. Update `.env` file

In `backend/.env`, add AI service configuration:

```env
# ... existing config ...

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_TIMEOUT=30000
ENABLE_AI_CLASSIFICATION=true
ENABLE_AI_CLUSTERING=true
ENABLE_AI_PRIORITIZATION=true
ENABLE_AI_SENTIMENT=true
```

### 2. Create AI Client Wrapper

Create `backend/utils/aiServiceClient.js`:

```javascript
const axios = require('axios');

class AIServiceClient {
  constructor(baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8001') {
    this.baseURL = baseURL;
    this.timeout = parseInt(process.env.AI_SERVICE_TIMEOUT || '30000');
    
    this.client = axios.create({
      baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Classify a single issue
   */
  async classify(text, title = '', language = 'en') {
    try {
      const response = await this.client.post('/api/v1/classify', {
        text,
        title,
        language
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'classification');
    }
  }

  /**
   * Classify multiple issues in batch
   */
  async classifyBatch(issues) {
    try {
      const response = await this.client.post('/api/v1/classify-batch', issues);
      return response.data;
    } catch (error) {
      this._handleError(error, 'batch classification');
    }
  }

  /**
   * Get semantic embeddings for texts
   */
  async getEmbeddings(texts) {
    try {
      const response = await this.client.post('/api/v1/embed', { texts });
      return response.data;
    } catch (error) {
      this._handleError(error, 'embedding');
    }
  }

  /**
   * Cluster similar issues
   */
  async clusterIssues(issues, similarityThreshold = 0.75) {
    try {
      const response = await this.client.post('/api/v1/cluster', {
        issues,
        similarity_threshold: similarityThreshold
      });
      return response.data;
    } catch (error) {
      this._handleError(error, 'clustering');
    }
  }

  /**
   * Calculate priority for an issue
   */
  async calculatePriority(issueData) {
    try {
      const response = await this.client.post('/api/v1/prioritize', issueData);
      return response.data;
    } catch (error) {
      this._handleError(error, 'prioritization');
    }
  }

  /**
   * Calculate priority for multiple issues
   */
  async calculatePriorityBatch(issues) {
    try {
      const response = await this.client.post('/api/v1/prioritize-batch', issues);
      return response.data;
    } catch (error) {
      this._handleError(error, 'batch prioritization');
    }
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(texts) {
    try {
      const response = await this.client.post('/api/v1/sentiment', { texts });
      return response.data;
    } catch (error) {
      this._handleError(error, 'sentiment analysis');
    }
  }

  /**
   * Get supported categories
   */
  async getCategories() {
    try {
      const response = await this.client.get('/api/v1/categories');
      return response.data;
    } catch (error) {
      this._handleError(error, 'fetching categories');
    }
  }

  /**
   * Get model information
   */
  async getModelInfo() {
    try {
      const response = await this.client.get('/api/v1/models');
      return response.data;
    } catch (error) {
      this._handleError(error, 'fetching model info');
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.warn('AI Service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Error handler
   */
  _handleError(error, operation) {
    if (error.response) {
      const message = error.response.data?.error || error.message;
      console.error(`AI Service ${operation} failed:`, message);
      throw new Error(`AI Service error: ${message}`);
    } else if (error.request) {
      console.error(`AI Service ${operation} - No response received`);
      throw new Error('AI Service not responding');
    } else {
      console.error(`AI Service ${operation} error:`, error.message);
      throw error;
    }
  }
}

module.exports = AIServiceClient;
```

---

## Middleware Integration

### 1. Classification Middleware

Create `backend/middlewares/aiClassification.js`:

```javascript
const AIServiceClient = require('../utils/aiServiceClient');
const asyncHandler = require('../utils/asyncHandler');

const aiClient = new AIServiceClient();

/**
 * Middleware to auto-classify issues
 * Attaches classification data to req.body
 */
const classificationMiddleware = asyncHandler(async (req, res, next) => {
  if (!process.env.ENABLE_AI_CLASSIFICATION || process.env.ENABLE_AI_CLASSIFICATION === 'false') {
    return next();
  }

  const { title, description, language = 'en' } = req.body;

  if (!description) {
    return next();
  }

  try {
    const result = await aiClient.classify(description, title, language);
    
    // Attach classification to request
    req.body.category = result.primary_category;
    req.body.categoryConfidence = result.confidence;
    req.body.categoryDetails = {
      primary: result.primary_category,
      secondary: result.secondary_categories,
      reasoning: result.reasoning,
      confidence: result.confidence
    };

    console.log(`[AI] Issue classified as: ${result.primary_category} (${(result.confidence * 100).toFixed(1)}%)`);
  } catch (error) {
    console.error('[AI Classification Error]:', error.message);
    // Continue without classification on error
  }

  next();
});

module.exports = classificationMiddleware;
```

### 2. Prioritization Middleware

Create `backend/middlewares/aiPrioritization.js`:

```javascript
const AIServiceClient = require('../utils/aiServiceClient');
const asyncHandler = require('../utils/asyncHandler');

const aiClient = new AIServiceClient();

/**
 * Helper to calculate location density
 * Counts issues within 1km radius
 */
async function getLocationDensity(location, Issue) {
  try {
    if (!location || !location.coordinates) return 50; // Default
    
    const nearby = await Issue.countDocuments({
      location: {
        $near: {
          $geometry: location,
          $maxDistance: 1000 // 1km
        }
      }
    });
    
    return Math.min(100, nearby * 10); // Scale to 0-100
  } catch (error) {
    console.warn('Could not calculate location density:', error.message);
    return 50;
  }
}

/**
 * Middleware to calculate priority using AI service
 */
const prioritizationMiddleware = (Issue) => {
  return asyncHandler(async (req, res, next) => {
    if (!process.env.ENABLE_AI_PRIORITIZATION || process.env.ENABLE_AI_PRIORITIZATION === 'false') {
      return next();
    }

    const { category, location, upvotes = 0, safetyRating = 50 } = req.body;

    if (!category) {
      return next();
    }

    try {
      // Calculate location density
      const locationDensity = await getLocationDensity(location, Issue);
      
      // Get age in hours
      const createdAt = new Date();
      const ageHours = 0;

      // Call AI service
      const result = await aiClient.calculatePriority({
        issue_id: req.body._id || 'new',
        category,
        location_density: locationDensity,
        citizen_upvotes: upvotes,
        age_hours: ageHours,
        safety_rating: safetyRating
      });

      // Attach priority to request
      req.body.priority = result.priority_level;
      req.body.priorityScore = result.priority_score;
      req.body.priorityFactors = result.factors;

      // Calculate SLA deadline
      const slaHours = {
        'High': 24,
        'Medium': 72,
        'Low': 168
      }[result.priority_level] || 72;

      req.body.slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

      console.log(`[AI] Priority set to: ${result.priority_level} (score: ${result.priority_score}/100)`);
    } catch (error) {
      console.error('[AI Prioritization Error]:', error.message);
      // Continue without prioritization on error
    }

    next();
  });
};

module.exports = prioritizationMiddleware;
```

### 3. Sentiment Analysis Middleware

Create `backend/middlewares/aiSentiment.js`:

```javascript
const AIServiceClient = require('../utils/aiServiceClient');
const asyncHandler = require('../utils/asyncHandler');

const aiClient = new AIServiceClient();

/**
 * Middleware to analyze feedback sentiment
 */
const sentimentMiddleware = asyncHandler(async (req, res, next) => {
  if (!process.env.ENABLE_AI_SENTIMENT || process.env.ENABLE_AI_SENTIMENT === 'false') {
    return next();
  }

  const { feedbackText, comment } = req.body;
  const text = feedbackText || comment;

  if (!text) {
    return next();
  }

  try {
    const result = await aiClient.analyzeSentiment([text]);
    
    if (result.sentiments && result.sentiments.length > 0) {
      const sentiment = result.sentiments[0];
      
      req.body.sentimentAnalysis = {
        sentiment: sentiment.sentiment,
        score: sentiment.score,
        confidence: sentiment.confidence,
        keywords: sentiment.keywords
      };

      console.log(`[AI] Feedback sentiment: ${sentiment.sentiment} (${(sentiment.confidence * 100).toFixed(1)}%)`);
    }
  } catch (error) {
    console.error('[AI Sentiment Error]:', error.message);
    // Continue without sentiment analysis on error
  }

  next();
});

module.exports = sentimentMiddleware;
```

---

## Route Integration

### Update `backend/routes/issues.js`

```javascript
const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issues');
const classificationMiddleware = require('../middlewares/aiClassification');
const prioritizationMiddleware = require('../middlewares/aiPrioritization');
const Issue = require('../models/issues');

// Apply AI middlewares to creation/update routes
router.post(
  '/report',
  classificationMiddleware,
  prioritizationMiddleware(Issue),
  issueController.createIssue
);

router.put(
  '/:id',
  classificationMiddleware,
  prioritizationMiddleware(Issue),
  issueController.updateIssue
);

// ... rest of routes
module.exports = router;
```

### Create Clustering Route

Create `backend/routes/clustering.js`:

```javascript
const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const AIServiceClient = require('../utils/aiServiceClient');
const Issue = require('../models/issues');
const IssueCluster = require('../models/issueCluster');

const aiClient = new AIServiceClient();

/**
 * GET /api/clustering/analyze
 * Find and cluster duplicate issues
 */
router.post('/analyze', asyncHandler(async (req, res) => {
  const { limit = 100, similarityThreshold = 0.75 } = req.body;

  // Get recent issues
  const issues = await Issue.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  if (issues.length < 2) {
    return res.json({ 
      message: 'Not enough issues to cluster',
      total: issues.length 
    });
  }

  try {
    // Get embeddings for all issues
    const texts = issues.map(i => `${i.title}. ${i.description}`);
    const embeddingResult = await aiClient.getEmbeddings(texts);

    // Cluster the issues
    const issuesWithEmbeddings = issues.map((issue, idx) => ({
      id: issue._id.toString(),
      embedding: embeddingResult.embeddings[idx]
    }));

    const clusterResult = await aiClient.clusterIssues(
      issuesWithEmbeddings,
      similarityThreshold
    );

    // Store clustering results
    const clusters = clusterResult.clusters;
    const processedClusters = [];

    for (const cluster of clusters) {
      if (cluster.members.length > 1) {
        const memberIssues = cluster.members.map(idx => issues[idx]._id);
        const masterIssue = issues[cluster.members[0]];

        // Create cluster in database
        const newCluster = await IssueCluster.create({
          masterIssueId: masterIssue._id,
          memberIssueIds: memberIssues,
          totalIssuesInCluster: cluster.size,
          averageSimilarity: cluster.quality,
          commonLocation: masterIssue.location,
          clusterQuality: {
            silhouetteScore: cluster.quality,
            compactness: cluster.quality,
            separation: Math.max(0, cluster.quality - 0.1)
          }
        });

        // Update member issues
        await Issue.updateMany(
          { _id: { $in: memberIssues } },
          { 
            clusterId: newCluster._id,
            isMasterIssue: masterIssue._id.equals(memberIssues[0])
          }
        );

        processedClusters.push(newCluster);
      }
    }

    res.json({
      success: true,
      totalIssuesAnalyzed: issues.length,
      clustersCreated: processedClusters.length,
      mergedIssues: clusterResult.cluster_quality.total_merged,
      clusters: processedClusters
    });

  } catch (error) {
    console.error('Clustering error:', error.message);
    res.status(500).json({ error: 'Clustering failed' });
  }
}));

/**
 * GET /api/clustering/cluster/:clusterId
 * Get cluster details
 */
router.get('/:clusterId', asyncHandler(async (req, res) => {
  const cluster = await IssueCluster.findById(req.params.clusterId)
    .populate('masterIssueId')
    .populate('memberIssueIds');

  if (!cluster) {
    return res.status(404).json({ error: 'Cluster not found' });
  }

  res.json(cluster);
}));

module.exports = router;
```

---

## Error Handling

Add robust error handling for AI service failures:

```javascript
// In server.js or main error handler
const handleAIServiceError = (error, req, res, next) => {
  if (error.message.includes('AI Service')) {
    console.warn('[AI Service Degradation] Continuing without AI features');
    // Set flag that AI was unavailable
    req.aiServiceUnavailable = true;
    // Continue without AI enhancements
    return next();
  }
  next(error);
};

app.use(handleAIServiceError);
```

---

## Testing

### Test with cURL

```bash
# Start AI service
cd backend/ai_service
python main.py

# Test classification
curl -X POST http://localhost:8001/api/v1/classify \
  -H "Content-Type: application/json" \
  -d '{"text":"Pothole on Main Street","title":"Street damage"}'

# Test health
curl http://localhost:8001/health
```

### Test Node.js Integration

Create `backend/__tests__/ai-integration.test.js`:

```javascript
const AIServiceClient = require('../utils/aiServiceClient');

describe('AI Service Integration', () => {
  let aiClient;

  beforeAll(() => {
    aiClient = new AIServiceClient();
  });

  test('Should classify an issue', async () => {
    const result = await aiClient.classify(
      'Pothole causing accidents',
      'Dangerous pothole'
    );

    expect(result.primary_category).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('Should calculate priority', async () => {
    const result = await aiClient.calculatePriority({
      issue_id: 'test_1',
      category: 'Roads & Infrastructure',
      location_density: 75,
      citizen_upvotes: 5,
      age_hours: 24,
      safety_rating: 85
    });

    expect(result.priority_level).toMatch(/High|Medium|Low/);
    expect(result.priority_score).toBeGreaterThanOrEqual(0);
  });

  test('Should perform health check', async () => {
    const healthy = await aiClient.healthCheck();
    expect(healthy).toBe(true);
  });
});
```

---

## Summary

The integration provides:
- ✅ Automatic classification of incoming issues
- ✅ Smart prioritization based on multiple factors
- ✅ Duplicate detection and clustering
- ✅ Feedback sentiment analysis
- ✅ Graceful degradation if AI service is unavailable
- ✅ Comprehensive error handling
- ✅ Easy testing and validation

All AI enhancements are optional and the application will continue functioning even if the AI service is unavailable.
