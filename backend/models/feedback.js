const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // ============================================
  // REFERENCES
  // ============================================
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  
  // ============================================
  // SATISFACTION METRICS
  // ============================================
  overallSatisfaction: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  
  resolutionQuality: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  timeliness: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  communication: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  // ============================================
  // FEEDBACK DETAILS
  // ============================================
  feedbackText: String,
  
  isResolutionPermanent: Boolean, // Did the issue stay resolved?
  
  wouldReportAgain: Boolean, // Would citizen use platform again?
  
  likeMostAbout: String, // Positive feedback
  improvementSuggestions: String, // What could be better
  
  // ============================================
  // FOLLOW-UP ASSESSMENT
  // ============================================
  issueReoccurred: Boolean,
  reoccurrenceDate: Date,
  reoccurrenceDetails: String,
  
  furtherActionNeeded: Boolean,
  followUpRequested: Boolean,
  
  // ============================================
  // TEMPORAL DATA
  // ============================================
  feedbackProvidedAt: {
    type: Date,
    default: Date.now,
  },
  
  daysAfterResolution: Number, // How many days after resolution
  
  resolutionDate: Date, // When the original issue was resolved
  reportDate: Date,     // When the original issue was reported
  
  // ============================================
  // SENTIMENT ANALYSIS
  // ============================================
  sentimentAnalysis: {
    overall: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
    },
    score: Number, // -1 to 1
    keywords: [String],
  },
  
  // ============================================
  // METADATA
  // ============================================
  feedbackChannel: {
    type: String,
    enum: ['Mobile App', 'Web', 'SMS', 'Email', 'Phone', 'In-Person'],
    default: 'Mobile App',
  },
  
  language: {
    type: String,
    default: 'en',
  },
  
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  
  verified: {
    type: Boolean,
    default: false,
  },
  
  // ============================================
  // ADMINISTRATIVE
  // ============================================
  reviewedBy: mongoose.Schema.Types.ObjectId,
  reviewDate: Date,
  reviewNotes: String,
  
  visible: {
    type: Boolean,
    default: true,
  },
  
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Approved', 'Archived'],
    default: 'Submitted',
  },
  
}, {
  timestamps: true,
});

// ============================================
// INDEXES
// ============================================

feedbackSchema.index({ issueId: 1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ departmentId: 1 });
feedbackSchema.index({ feedbackProvidedAt: -1 });
feedbackSchema.index({ overallSatisfaction: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ issueId: 1, feedbackProvidedAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

feedbackSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.resolutionQuality,
    this.timeliness,
    this.communication
  ].filter(r => r !== undefined);
  
  if (ratings.length === 0) return null;
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
});

feedbackSchema.virtual('sentimentText').get(function() {
  if (!this.sentimentAnalysis) return null;
  return this.sentimentAnalysis.overall;
});

// ============================================
// METHODS
// ============================================

feedbackSchema.methods.calculateSentiment = function(text) {
  // Simple sentiment calculation (integration point for NLP service)
  if (!text) return;
  
  const positiveWords = ['good', 'excellent', 'great', 'satisfied', 'happy', 'thanks', 'appreciate', 'wonderful', 'perfect'];
  const negativeWords = ['bad', 'poor', 'disappointed', 'unhappy', 'terrible', 'waste', 'useless', 'frustrated', 'annoyed'];
  
  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  let sentiment = 'Neutral';
  let score = 0;
  
  if (positiveCount > negativeCount) {
    sentiment = 'Positive';
    score = 0.5 + (positiveCount / 10);
  } else if (negativeCount > positiveCount) {
    sentiment = 'Negative';
    score = -0.5 - (negativeCount / 10);
  } else if (positiveCount + negativeCount > 0) {
    sentiment = 'Mixed';
    score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }
  
  this.sentimentAnalysis = {
    overall: sentiment,
    score: Math.max(-1, Math.min(1, score)),
    keywords: [...new Set(
      [...positiveWords.filter(w => lowerText.includes(w)),
       ...negativeWords.filter(w => lowerText.includes(w))]
    )],
  };
  
  return this;
};

feedbackSchema.methods.approveFeedback = function(reviewedBy, notes) {
  this.status = 'Approved';
  this.reviewed = true;
  this.reviewedBy = reviewedBy;
  this.reviewDate = new Date();
  this.reviewNotes = notes;
  return this;
};

feedbackSchema.methods.isNegativeFeedback = function() {
  return this.overallSatisfaction <= 2;
};

feedbackSchema.methods.isPositiveFeedback = function() {
  return this.overallSatisfaction >= 4;
};

module.exports = mongoose.model('Feedback', feedbackSchema);
