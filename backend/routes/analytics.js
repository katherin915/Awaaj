/**
 * Analytics Routes
 * Shows AI-powered insights and statistics about issues
 */

const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const Issue = require('../models/issues');

/**
 * GET /api/analytics/overview
 * Dashboard overview with AI insights
 */
router.get('/overview', verifyToken, isAdmin, asyncHandler(async (req, res) => {
  const stats = {};

  // Total issues
  stats.totalIssues = await Issue.countDocuments();

  // Issues by category (AI classification)
  const categoryStats = await Issue.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$categoryConfidence' },
      },
    },
    { $sort: { count: -1 } },
  ]);
  stats.byCategory = categoryStats;

  // Issues by priority
  const priorityStats = await Issue.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
        avgScore: { $avg: '$priorityScore' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  stats.byPriority = priorityStats;

  // Issues by status
  const statusStats = await Issue.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  stats.byStatus = statusStats;

  // SLA Performance
  const now = new Date();
  const slaMetrics = await Issue.aggregate([
    {
      $facet: {
        onTime: [
          {
            $match: {
              slaDeadline: { $exists: true },
              $or: [
                { status: 'Resolved', resolvedAt: { $lte: '$slaDeadline' } },
                { status: { $ne: 'Resolved' }, slaDeadline: { $gte: now } },
              ],
            },
          },
          { $count: 'count' },
        ],
        overdue: [
          {
            $match: {
              slaDeadline: { $exists: true },
              status: { $ne: 'Resolved' },
              slaDeadline: { $lt: now },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  stats.slaMetrics = {
    onTime: slaMetrics[0].onTime[0]?.count || 0,
    overdue: slaMetrics[0].overdue[0]?.count || 0,
  };

  // Average priority score
  const avgPriorityAgg = await Issue.aggregate([
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$priorityScore' },
        minScore: { $min: '$priorityScore' },
        maxScore: { $max: '$priorityScore' },
      },
    },
  ]);

  if (avgPriorityAgg.length > 0) {
    stats.priorityMetrics = avgPriorityAgg[0];
  }

  // Recent high-priority issues
  stats.highPriorityRecent = await Issue.find({
    priority: 'High',
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title category priorityScore priority createdAt');

  // Category trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendStats = await Issue.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          category: '$category',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
  ]);

  stats.trends = trendStats;

  return res.json({
    success: true,
    data: stats,
    timestamp: new Date(),
  });
}));

/**
 * GET /api/analytics/category-heatmap
 * Location-based heatmap by category
 */
router.get('/category-heatmap', asyncHandler(async (req, res) => {
  const { category } = req.query;

  const match = {};
  if (category && category !== 'all') {
    match.category = category;
  }

  const heatmapData = await Issue.aggregate([
    { $match: match },
    {
      $match: {
        'location.coordinates': { $exists: true, $type: 'array' },
      },
    },
    {
      $group: {
        _id: {
          lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 2] },
          lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 2] },
        },
        count: { $sum: 1 },
        category: { $first: '$category' },
        avgPriority: { $avg: '$priorityScore' },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return res.json({
    success: true,
    data: heatmapData,
  });
}));

/**
 * GET /api/analytics/ai-performance
 * AI model performance metrics
 */
router.get('/ai-performance', verifyToken, isAdmin, asyncHandler(async (req, res) => {
  // Classification confidence
  const classificationStats = await Issue.aggregate([
    {
      $match: {
        categoryConfidence: { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        avgConfidence: { $avg: '$categoryConfidence' },
        minConfidence: { $min: '$categoryConfidence' },
        maxConfidence: { $max: '$categoryConfidence' },
        totalClassified: { $sum: 1 },
      },
    },
  ]);

  // Clustering effectiveness
  const clusterStats = await Issue.aggregate([
    {
      $match: {
        clusterId: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$clusterId',
        memberCount: { $sum: 1 },
        avgSimilarity: { $avg: '$clusterQuality.averageSimilarity' },
      },
    },
    {
      $group: {
        _id: null,
        totalClusters: { $sum: 1 },
        avgClusterSize: { $avg: '$memberCount' },
        totalDuplicatesDetected: { $sum: { $subtract: ['$memberCount', 1] } },
        avgSimilarityScore: { $avg: '$avgSimilarity' },
      },
    },
  ]);

  // Priority score distribution
  const priorityDistribution = await Issue.aggregate([
    {
      $bucket: {
        groupBy: '$priorityScore',
        boundaries: [0, 20, 40, 60, 80, 100],
        default: 'Other',
        count: { $sum: 1 },
      },
    },
  ]);

  return res.json({
    success: true,
    data: {
      classification: classificationStats[0] || {},
      clustering: clusterStats[0] || {},
      priorityDistribution,
    },
  });
}));

/**
 * GET /api/analytics/duplicate-analysis
 * Analyze duplicate and clustered issues
 */
router.get('/duplicate-analysis', asyncHandler(async (req, res) => {
  const clusters = await Issue.aggregate([
    {
      $match: {
        clusterId: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$clusterId',
        masterIssueId: { $first: '$_id' },
        issues: {
          $push: {
            _id: '$_id',
            title: '$title',
            similarity: '$clusterQuality.averageSimilarity',
          },
        },
        totalCount: { $sum: 1 },
        createdAt: { $min: '$createdAt' },
      },
    },
    {
      $match: {
        totalCount: { $gt: 1 }, // Only clusters with > 1 issue
      },
    },
    {
      $sort: { totalCount: -1 },
    },
    {
      $limit: 20,
    },
  ]);

  // Calculate deduplication impact
  const totalDuplicates = clusters.reduce((sum, cluster) => sum + cluster.totalCount - 1, 0);

  return res.json({
    success: true,
    data: {
      clusters,
      duplicatesSaved: totalDuplicates,
      totalClusters: clusters.length,
      estimatedTimeReduction: `${totalDuplicates * 5} minutes`, // Assuming 5 min per review
    },
  });
}));

/**
 * GET /api/analytics/location-insights
 * Geospatial analysis of issues
 */
router.get('/location-insights', asyncHandler(async (req, res) => {
  const locationStats = await Issue.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [0, 0] }, // Center point
        distanceField: 'distance',
        spherical: true,
      },
    },
    {
      $group: {
        _id: {
          ward: '$ward',
          city: '$city',
        },
        issueCount: { $sum: 1 },
        avgPriority: { $avg: '$priorityScore' },
        categories: { $push: '$category' },
      },
    },
    {
      $sort: { issueCount: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return res.json({
    success: true,
    data: locationStats,
  });
}));

module.exports = router;
