const mongoose = require('mongoose');

const issueClusterSchema = new mongoose.Schema({
  // ============================================
  // CLUSTER IDENTIFICATION
  // ============================================
  masterIssueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  
  clusterName: String, // Human-readable name
  
  // ============================================
  // CLUSTER COMPOSITION
  // ============================================
  memberIssueIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    }
  ],
  
  totalIssuesInCluster: {
    type: Number,
    default: 1,
  },
  
  // ============================================
  // SIMILARITY METRICS
  // ============================================
  averageSimilarity: {
    type: Number,
    min: 0,
    max: 1,
  },
  
  clusterQuality: {
    silhouetteScore: Number, // -1 to 1
    compactness: Number,      // 0 to 1
    separation: Number,       // 0 to 1
  },
  
  // ============================================
  // CLUSTER CHARACTERISTICS
  // ============================================
  category: String,
  
  commonLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: [Number], // [longitude, latitude]
    ward: String,
  },
  
  locationVariance: Number, // Spread of issues in cluster
  
  // ============================================
  // TEMPORAL INFORMATION
  // ============================================
  firstReportDate: Date,
  lastReportDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  
  // ============================================
  // IMPACT METRICS
  // ============================================
  totalCitizensAffected: {
    type: Number,
    default: 1,
  },
  
  combinedUpvotes: {
    type: Number,
    default: 0,
  },
  
  combinedPriority: String,
  combinedPriorityScore: Number,
  
  // ============================================
  // RESOLUTION STATUS
  // ============================================
  resolutionStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Partially Resolved', 'Resolved'],
    default: 'Pending',
  },
  
  resolvedIssueCount: {
    type: Number,
    default: 0,
  },
  
  // ============================================
  // METADATA
  // ============================================
  tags: [String],
  
  clusteringAlgorithm: {
    type: String,
    default: 'semantic_similarity',
  },
  
  modelVersion: String, // NLP model version
  
}, {
  timestamps: true,
});

// ============================================
// INDEXES
// ============================================

issueClusterSchema.index({ masterIssueId: 1 });
issueClusterSchema.index({ memberIssueIds: 1 });
issueClusterSchema.index({ category: 1 });
issueClusterSchema.index({ 'commonLocation.coordinates': '2dsphere' });
issueClusterSchema.index({ totalIssuesInCluster: -1 });
issueClusterSchema.index({ combinedPriorityScore: -1 });
issueClusterSchema.index({ createdAt: -1 });

// ============================================
// METHODS
// ============================================

issueClusterSchema.methods.addIssueToCluster = function(issueId) {
  if (!this.memberIssueIds.includes(issueId)) {
    this.memberIssueIds.push(issueId);
    this.totalIssuesInCluster = this.memberIssueIds.length;
  }
  return this;
};

issueClusterSchema.methods.removeIssueFromCluster = function(issueId) {
  this.memberIssueIds = this.memberIssueIds.filter(id => !id.equals(issueId));
  this.totalIssuesInCluster = this.memberIssueIds.length;
  return this;
};

issueClusterSchema.methods.mergeClusters = function(otherCluster) {
  // Merge two clusters
  this.memberIssueIds = [...new Set([
    ...this.memberIssueIds,
    ...otherCluster.memberIssueIds
  ])];
  this.totalIssuesInCluster = this.memberIssueIds.length;
  return this;
};

module.exports = mongoose.model('IssueCluster', issueClusterSchema);
