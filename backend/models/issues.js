const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  // ============================================
  // ORIGINAL FIELDS
  // ============================================
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  phone: String,
  email: {
    type: String,
    required: true,
  },
  fileUrl: String,
  notifyByEmail: {
    type: Boolean,
    default: false,
  },
  
  // ============================================
  // GEOLOCATION FIELDS (Enhanced)
  // ============================================
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
    address: String,
    ward: String,
    city: String,
    postalCode: String,
  },
  
  // ============================================
  // AI/ML FIELDS - CATEGORIZATION
  // ============================================
  category: {
    type: String,
    enum: [
      'Roads & Infrastructure',
      'Water & Sanitation',
      'Electricity & Power',
      'Waste Management',
      'Public Amenities',
      'Environment',
      'Others'
    ],
    default: 'Others',
  },
  categoryConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  categoryDetails: {
    primaryCategory: String,
    secondaryCategories: [String],
    reasoning: String, // For transparency
  },
  
  // ============================================
  // PRIORITY & URGENCY
  // ============================================
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  priorityFactors: {
    categoryRisk: Number,      // 0-100
    locationDensity: Number,   // 0-100
    citizenUpvotes: Number,    // Vote count
    ageInDays: Number,         // How old the issue is
    safetyRating: Number,      // Safety concern level
  },
  
  // ============================================
  // SEMANTIC CLUSTERING (Deduplication)
  // ============================================
  clusterId: mongoose.Schema.Types.ObjectId,
  isMasterIssue: {
    type: Boolean,
    default: false,
  },
  duplicateCount: {
    type: Number,
    default: 0,
  },
  mergedIssueIds: [mongoose.Schema.Types.ObjectId],
  semanticSimilarity: {
    embedding: [Number], // Store issue embedding for clustering
    embeddingVersion: String, // Model version used
  },
  
  // ============================================
  // SLA & TRACKING
  // ============================================
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Closed', 'On Hold', 'Rejected'],
    default: 'Pending',
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: String,
    comment: String,
  }],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignedAt: Date,
  resolvedAt: Date,
  closedAt: Date,
  
  slaDeadline: Date,
  slaStatus: {
    type: String,
    enum: ['On-Track', 'At-Risk', 'Overdue'],
    default: 'On-Track',
  },
  resolutionTimeMinutes: Number,
  
  // ============================================
  // ASSIGNMENT & WORKFLOW
  // ============================================
  department: String,
  assignedTo: mongoose.Schema.Types.ObjectId, // Reference to admin/worker
  workerName: String,
  
  // ============================================
  // CITIZEN ENGAGEMENT
  // ============================================
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [mongoose.Schema.Types.ObjectId],
  citizenCount: {
    type: Number,
    default: 1, // At least the reporter
  },
  
  // ============================================
  // FEEDBACK & SATISFACTION
  // ============================================
  feedback: {
    isSatisfied: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    feedbackDate: Date,
    feedbackTime: Number, // Hours after resolution
  },
  
  feedbackStatus: {
    type: String,
    enum: ['Not Requested', 'Pending', 'Received', 'Skipped'],
    default: 'Not Requested',
  },
  
  // ============================================
  // MEDIA & ATTACHMENTS
  // ============================================
  media: {
    imageUrl: String,
    imagePublicId: String, // Cloudinary ID
    videoUrl: String,
    mediaType: String,
  },
  
  // ============================================
  // METADATA & AUDIT
  // ============================================
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  
  language: {
    type: String,
    default: 'en',
  },
  
  keywords: [String], // Extracted from description
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
  },
  sentimentScore: Number, // -1 to 1
  
  updateHistory: [{
    field: String,
    oldValue: String,
    newValue: String,
    updatedAt: Date,
    updatedBy: String,
  }],
  
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true,
  },
  
  // ============================================
  // SPATIAL INDEXING (for geo-queries)
  // ============================================
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================

// Geospatial index for location-based queries
issueSchema.index({ 'location.coordinates': '2dsphere' });

// Category and priority indexes
issueSchema.index({ category: 1 });
issueSchema.index({ priority: 1, priorityScore: -1 });

// Clustering and deduplication
issueSchema.index({ clusterId: 1 });
issueSchema.index({ isMasterIssue: 1 });

// Status and SLA tracking
issueSchema.index({ status: 1, slaStatus: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ slaDeadline: 1 });

// Department and assignment
issueSchema.index({ department: 1, status: 1 });
issueSchema.index({ assignedTo: 1 });

// Compound indexes for common queries
issueSchema.index({ category: 1, status: 1, createdAt: -1 });
issueSchema.index({ ward: 1, createdAt: -1 });
issueSchema.index({ priority: 1, status: 1, createdAt: -1 });

// Text search index
issueSchema.index({ title: 'text', description: 'text', keywords: 'text' });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Calculate days since creation
issueSchema.virtual('ageDays').get(function() {
  if (!this.createdAt) return 0;
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Calculate if SLA is breached
issueSchema.virtual('isSlaBreach').get(function() {
  return this.slaStatus === 'Overdue';
});

// Calculate resolution time
issueSchema.virtual('resolvedInMinutes').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60));
  }
  return null;
});

// ============================================
// METHODS
// ============================================

// Update status with history
issueSchema.methods.updateStatus = function(newStatus, changedBy, comment) {
  this.status = newStatus;
  
  if (!this.statusHistory) {
    this.statusHistory = [];
  }
  
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: changedBy,
    comment: comment,
  });
  
  // Update timestamps
  if (newStatus === 'In Progress') {
    this.assignedAt = new Date();
  } else if (newStatus === 'Resolved') {
    this.resolvedAt = new Date();
  } else if (newStatus === 'Closed') {
    this.closedAt = new Date();
  }
  
  return this;
};

// Set priority based on factors
issueSchema.methods.calculatePriority = function() {
  if (!this.priorityFactors) {
    this.priorityFactors = {};
  }
  
  // Weighted calculation
  const weights = {
    categoryRisk: 0.35,
    locationDensity: 0.25,
    citizenUpvotes: 0.20,
    ageInDays: 0.10,
    safetyRating: 0.10,
  };
  
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    score += (this.priorityFactors[key] || 0) * weight;
  }
  
  this.priorityScore = Math.round(score);
  
  // Assign priority level
  if (score >= 70) {
    this.priority = 'High';
  } else if (score >= 40) {
    this.priority = 'Medium';
  } else {
    this.priority = 'Low';
  }
  
  return this;
};

// Mark as master issue with duplicate count
issueSchema.methods.markAsMaster = function(duplicateCount = 0) {
  this.isMasterIssue = true;
  this.duplicateCount = duplicateCount;
  return this;
};

// Add upvote
issueSchema.methods.addUpvote = function(userId) {
  if (!this.upvotedBy.includes(userId)) {
    this.upvotedBy.push(userId);
    this.upvotes += 1;
  }
  return this;
};

module.exports = mongoose.model('Issue', issueSchema);
