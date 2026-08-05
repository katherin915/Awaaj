import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Database, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const AIAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [aiPerformance, setAiPerformance] = useState(null);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [analyticsRes, aiRes, duplicateRes] = await Promise.all([
          axios.get('/api/analytics/overview', { headers }),
          axios.get('/api/analytics/ai-performance', { headers }),
          axios.get('/api/analytics/duplicate-analysis', { headers }),
        ]);

        setAnalytics(analyticsRes.data.data);
        setAiPerformance(aiRes.data.data);
        setDuplicateAnalysis(duplicateRes.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading AI Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time insights powered by machine learning</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Issues */}
          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300">Total Issues</h3>
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-3xl font-bold">{analytics?.totalIssues || 0}</p>
          </div>

          {/* Average Priority Score */}
          <div className="bg-orange-500 bg-opacity-20 border border-orange-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300">Avg Priority Score</h3>
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-3xl font-bold">
              {aiPerformance?.priorityDistribution ? 
                Math.round(analytics?.priorityMetrics?.avgScore || 0) : 0
              }
            </p>
          </div>

          {/* Duplicates Detected */}
          <div className="bg-purple-500 bg-opacity-20 border border-purple-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300">Duplicates Found</h3>
              <AlertTriangle className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold">{duplicateAnalysis?.duplicatesSaved || 0}</p>
          </div>

          {/* Classification Accuracy */}
          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300">Classification Accuracy</h3>
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-3xl font-bold">
              {aiPerformance?.classification?.avgConfidence ? 
                (aiPerformance.classification.avgConfidence * 100).toFixed(1) : 0
              }%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issues by Category */}
          <div className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">Issues by Category</h3>
            {analytics?.byCategory && analytics.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.byCategory}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} issues`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">No data available</p>
            )}
          </div>

          {/* Issues by Priority */}
          <div className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">Issues by Priority Level</h3>
            {analytics?.byPriority && analytics.byPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#445" />
                  <XAxis dataKey="_id" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    formatter={(value) => `${value} issues`}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">No data available</p>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">Issues by Status</h3>
            {analytics?.byStatus && analytics.byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#445" />
                  <XAxis dataKey="_id" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    formatter={(value) => `${value} issues`}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">No data available</p>
            )}
          </div>

          {/* SLA Performance */}
          <div className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-4">SLA Performance</h3>
            {analytics?.slaMetrics ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'On Time', value: analytics.slaMetrics.onTime, fill: '#10b981' },
                      { name: 'Overdue', value: analytics.slaMetrics.overdue, fill: '#ef4444' },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value} issues`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* High Priority Issues */}
        {analytics?.highPriorityRecent && analytics.highPriorityRecent.length > 0 && (
          <div className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg p-6 mb-8">
            <h3 className="text-white text-xl font-bold mb-4">🚨 High Priority Issues (Recent)</h3>
            <div className="space-y-3">
              {analytics.highPriorityRecent.map((issue) => (
                <div key={issue._id} className="flex items-center justify-between bg-slate-800 p-4 rounded">
                  <div>
                    <p className="text-white font-semibold">{issue.title}</p>
                    <p className="text-gray-400 text-sm">Category: {issue.category} • Score: {issue.priorityScore}</p>
                  </div>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {issue.priorityLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Model Performance */}
        {aiPerformance && (
          <div className="bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-white text-xl font-bold mb-6">🤖 AI Model Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Classification */}
              <div className="bg-slate-800 p-4 rounded">
                <h4 className="text-blue-400 font-semibold mb-3">Classification</h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>
                    Avg Confidence: <span className="text-blue-400 font-bold">
                      {aiPerformance.classification?.avgConfidence ? 
                        (aiPerformance.classification.avgConfidence * 100).toFixed(1) : 0
                      }%
                    </span>
                  </p>
                  <p>
                    Total Classified: <span className="text-blue-400 font-bold">
                      {aiPerformance.classification?.totalClassified || 0}
                    </span>
                  </p>
                </div>
              </div>

              {/* Clustering */}
              <div className="bg-slate-800 p-4 rounded">
                <h4 className="text-green-400 font-semibold mb-3">Duplicate Detection</h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>
                    Clusters Found: <span className="text-green-400 font-bold">
                      {aiPerformance.clustering?.totalClusters || 0}
                    </span>
                  </p>
                  <p>
                    Duplicates Detected: <span className="text-green-400 font-bold">
                      {aiPerformance.clustering?.totalDuplicatesDetected || 0}
                    </span>
                  </p>
                </div>
              </div>

              {/* Priority */}
              <div className="bg-slate-800 p-4 rounded">
                <h4 className="text-orange-400 font-semibold mb-3">Priority Scoring</h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>
                    Avg Score: <span className="text-orange-400 font-bold">
                      {analytics?.priorityMetrics?.avgScore ? 
                        Math.round(analytics.priorityMetrics.avgScore) : 0
                      }
                    </span>
                  </p>
                  <p>
                    Range: <span className="text-orange-400 font-bold">
                      {analytics?.priorityMetrics?.minScore ? 
                        `${Math.round(analytics.priorityMetrics.minScore)}-${Math.round(analytics.priorityMetrics.maxScore)}`
                        : 'N/A'
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyticsDashboard;
