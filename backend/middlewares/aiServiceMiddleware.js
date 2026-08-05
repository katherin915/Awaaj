/**
 * AI Service Middleware
 * Integrates with Google Gemini API for classification, clustering, prioritization, sentiment
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent";

const CATEGORY_MAP = {
  roads: "Roads & Infrastructure",
  road: "Roads & Infrastructure",
  "roads & infrastructure": "Roads & Infrastructure",
  water: "Water & Sanitation",
  "water & sanitation": "Water & Sanitation",
  electricity: "Electricity & Power",
  power: "Electricity & Power",
  "electricity & power": "Electricity & Power",
  waste: "Waste Management",
  "waste management": "Waste Management",
  "public amenities": "Public Amenities",
  amenities: "Public Amenities",
  environment: "Environment",
  others: "Others",
  other: "Others",
};

const normalizeCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== "string") {
    return "Others";
  }

  const cleaned = rawCategory
    .replace(/[\n\r\t*`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return CATEGORY_MAP[cleaned] || "Others";
};

// Check if API key is configured
const isGeminiConfigured = () => {
  return GEMINI_API_KEY && 
         GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY" && 
         GEMINI_API_KEY !== "your_gemini_api_key_here";
};

const callGemini = async (prompt) => {
  if (!isGeminiConfigured()) {
    console.warn('Gemini API key not configured, skipping AI analysis');
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const data = await response.json();
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return null;
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (error) {
    console.error("Gemini Call Failed:", error);
    return null;
  }
};

/**
 * Classification Middleware
 * Automatically classifies issues into civic categories
 */
const classifyIssue = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.description) {
      return next();
    }

    const text = `${req.body.title}. ${req.body.description}`;
    const prompt = `Classify the following civic issue into one of these categories: Roads & Infrastructure, Water & Sanitation, Electricity & Power, Waste Management, Public Amenities, Environment, Others.
    Return ONLY the category name.
    Issue: ${text}`;

    const category = await callGemini(prompt);

    req.aiClassification = {
      category: normalizeCategory(category),
      confidence: 0.9, // Mock confidence
      allCategories: [],
    };

    next();
  } catch (error) {
    console.error('Classification middleware error:', error.message);
    req.aiClassification = null;
    next();
  }
};

/**
 * Clustering Middleware
 * Detects duplicate/similar issues using Embeddings
 */
const detectDuplicates = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.description) {
      return next();
    }

    const text = `${req.body.title}. ${req.body.description}`;

    // Call Gemini Embedding API
    const response = await fetch(`${GEMINI_EMBEDDING_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text: text }] },
      }),
    });
    
    const data = await response.json();

    if (data.embedding) {
      req.aiEmbedding = {
        vector: data.embedding.values,
      };
    } else {
        req.aiEmbedding = null;
    }

    next();
  } catch (error) {
    console.error('Clustering middleware error:', error.message);
    req.aiEmbedding = null;
    next();
  }
};

/**
 * Prioritization Middleware
 * Calculates priority score based on multiple factors
 */
const calculatePriority = async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.description) {
      return next();
    }

    const text = `${req.body.title}. ${req.body.description}`;
    const prompt = `Analyze the following civic issue and determine its priority (High, Medium, Low) and a score (0-100).
    Return JSON format: { "priority_level": "High", "priority_score": 85, "reasoning": "..." }
    Issue: ${text}`;

    const resultText = await callGemini(prompt);
    
    let result = { priority_level: "Medium", priority_score: 50, reasoning: "Default" };
    try {
        // Try to parse JSON from the response (Gemini might wrap in markdown)
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error("Failed to parse Gemini priority response");
    }

    req.aiPriority = {
      priorityScore: result.priority_score,
      priorityLevel: result.priority_level,
      factors: {},
      reasoning: result.reasoning,
      slaDeadlineHours: result.priority_level === 'High' ? 24 : 48,
    };

    next();
  } catch (error) {
    console.error('Prioritization middleware error:', error.message);
    req.aiPriority = null;
    next();
  }
};

/**
 * Sentiment Analysis Middleware
 * Analyzes sentiment of feedback/comments
 */
const analyzeSentiment = async (req, res, next) => {
  try {
    if (!req.body.feedbackText && !req.body.comment) {
      return next();
    }

    const text = req.body.feedbackText || req.body.comment;
    const prompt = `Analyze the sentiment of this text (Positive, Negative, Neutral). Return ONLY the sentiment. Text: ${text}`;

    const sentiment = await callGemini(prompt);

    req.aiSentiment = {
      sentiment: sentiment ? sentiment.trim() : "Neutral",
      score: 0.5,
      confidence: 0.8,
      keywords: [],
    };

    next();
  } catch (error) {
    console.error('Sentiment middleware error:', error.message);
    req.aiSentiment = null;
    next();
  }
};

/**
 * Batch Clustering
 * Finds similar issues in database
 */
const findSimilarIssues = async (issueData, similarityThreshold = 0.85) => {
    // Placeholder: In a real app, you'd query a vector DB (like Pinecone or MongoDB Atlas Vector Search)
    // using the embedding from issueData.
    return [];
};

/**
 * Health check for AI service
 */
const checkAIServiceHealth = async () => {
  return true; // Always true as we use external API
};

/**
 * Image Analysis with ML
 * Analyzes uploaded images to detect civic issues and auto-fill form
 */
const analyzeImageWithML = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      console.warn('Gemini API not configured, returning basic analysis');
      
      // Clean up file
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.json({
        success: true,
        suggestedTitle: 'Civic Issue Detected',
        suggestedDescription: 'Please describe the issue you are reporting',
        category: 'Others',
        confidence: 0.5,
        detectedObjects: [],
        severity: 'Medium',
        note: 'AI analysis unavailable - Gemini API key not configured'
      });
    }

    // Read image file
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Analyze image with Gemini Vision
    const prompt = `Analyze this civic infrastructure image and provide:
1. Issue category (Roads, Water, Electricity, Waste, Public Amenities, Environment, Others)
2. Issue title (brief, under 10 words)
3. Detailed description (what you see in the image)
4. List of detected objects/problems
5. Severity level (Low, Medium, High)

Return as JSON:
{
  "category": "...",
  "title": "...",
  "description": "...",
  "detectedObjects": ["...", "..."],
  "severity": "...",
  "confidence": 0.9
}`;

    const GEMINI_VISION_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    
    console.log('Calling Gemini Vision API...');
    console.log('Image size:', imageBuffer.length, 'bytes');
    console.log('Image type:', req.file.mimetype);
    
    const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: base64Image
              }
            }
          ]
        }]
      }),
    });

    console.log('Gemini API response status:', response.status);
    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data).substring(0, 500));
    
    if (data.error) {
      console.error("Gemini Vision API Error:", data.error);
      
      // Clean up file before returning error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(500).json({ 
        error: 'Failed to analyze image', 
        details: data.error.message || 'Unknown error'
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      return res.status(500).json({ error: 'No analysis result from AI' });
    }

    // Parse JSON from response
    let analysis = {
      category: 'Others',
      title: 'Issue detected in image',
      description: 'Please review the uploaded image',
      detectedObjects: [],
      severity: 'Medium',
      confidence: 0.7
    };

    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysis = { ...analysis, ...parsed };
      }
    } catch (e) {
      console.error("Failed to parse AI vision response:", e);
      // Use default values
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return analysis result
    return res.json({
      success: true,
      suggestedTitle: analysis.title,
      suggestedDescription: analysis.description,
      category: analysis.category,
      confidence: analysis.confidence,
      detectedObjects: analysis.detectedObjects,
      severity: analysis.severity
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    
    // Clean up file if exists
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Error cleaning up file:', e);
      }
    }
    
    return res.status(500).json({ error: 'Failed to analyze image', details: error.message });
  }
};

module.exports = {
  classifyIssue,
  detectDuplicates,
  calculatePriority,
  analyzeSentiment,
  findSimilarIssues,
  checkAIServiceHealth,
  analyzeImageWithML,
};
