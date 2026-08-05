import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api";import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Bell,
  LogOut,
  MapPin,
  Camera,
  MessageSquare,
  User
} from "lucide-react";
import { Toaster, toast } from 'react-hot-toast';
import csrfManager from "../utils/csrfManager";

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchIssues = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await csrfManager.secureFetch(`${API_BASE}/issues`);
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      } else {
        toast.error("Failed to fetch issues");
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast.error("Error connecting to server");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const response = await csrfManager.secureFetch(`${API_BASE}/issues/${issueId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newStatus }),
      });

      if (response.ok) {
        setIssues(prev => 
          prev.map(issue => 
            issue._id === issueId ? { ...issue, status: newStatus } : issue
          )
        );
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    "Pending": { color: "bg-amber-100 text-amber-800", icon: Clock },
    "In Progress": { color: "bg-blue-100 text-blue-800", icon: RefreshCw },
    "Resolved": { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
    "Rejected": { color: "bg-red-100 text-red-800", icon: XCircle }
  };

  const formatLocation = (location) => {
    if (!location) return "Unknown location";
    if (typeof location === "string") return location;
    if (location.address) return location.address;
    if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      const [lng, lat] = location.coordinates;
      if (typeof lat === "number" && typeof lng === "number") {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }
    return "Unknown location";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
                <p className="text-sm text-gray-500">Zone A - Field Operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate("/login")}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Assigned Issues</p>
            <p className="text-3xl font-bold text-gray-900">{issues.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Pending Resolution</p>
            <p className="text-3xl font-bold text-amber-600">{issues.filter(i => i.status === 'Pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Resolved Today</p>
            <p className="text-3xl font-bold text-emerald-600">0</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assigned issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <button
            onClick={fetchIssues}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Issues List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredIssues.map((issue) => (
            <div key={issue._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${issue.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {issue.priority} Priority
                      </span>
                      <span className="text-sm text-gray-500">• {issue.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusConfig[issue.status]?.color}`}>
                    {issue.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{issue.description}</p>
                
                {issue.aiSummary && (
                  <div className="bg-purple-50 p-3 rounded-lg mb-4 border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-1">AI Summary</p>
                    <p className="text-sm text-purple-800">{issue.aiSummary}</p>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <MapPin className="w-4 h-4 mr-1" />
                  {formatLocation(issue.location)}
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  {issue.dateReported}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
                      <MessageSquare className="w-4 h-4" />
                      <span>Add Note</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
                      <Camera className="w-4 h-4" />
                      <span>Upload Proof</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Update Status:</span>
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;
