import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { useComplaintsContext } from '../../context/ComplaintsContext';

const AnalyticsDashboard = () => {
  const { complaints } = useComplaintsContext();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate analytics data
  const calculateStats = () => {
    const now = new Date();
    const filteredComplaints = complaints.filter(complaint => {
      const complaintDate = new Date(complaint.createdAt);
      const daysDiff = Math.floor((now - complaintDate) / (1000 * 60 * 60 * 24));
      
      if (timeRange === '7d' && daysDiff > 7) return false;
      if (timeRange === '30d' && daysDiff > 30) return false;
      if (timeRange === '90d' && daysDiff > 90) return false;
      
      if (selectedCategory !== 'all' && complaint.category !== selectedCategory) return false;
      
      return true;
    });

    const total = filteredComplaints.length;
    const resolved = filteredComplaints.filter(c => c.status === 'resolved').length;
    const pending = filteredComplaints.filter(c => c.status === 'pending').length;
    const inProgress = filteredComplaints.filter(c => c.status === 'in_progress').length;
    const avgResolutionTime = calculateAverageResolutionTime(filteredComplaints);
    const categoryBreakdown = getCategoryBreakdown(filteredComplaints);
    const monthlyTrend = getMonthlyTrend(filteredComplaints);
    const engagementScore = calculateEngagementScore(filteredComplaints);

    return {
      total,
      resolved,
      pending,
      inProgress,
      avgResolutionTime,
      categoryBreakdown,
      monthlyTrend,
      engagementScore
    };
  };

  const calculateAverageResolutionTime = (complaints) => {
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
    if (resolvedComplaints.length === 0) return 0;

    const totalDays = resolvedComplaints.reduce((acc, complaint) => {
      const created = new Date(complaint.createdAt);
      const resolved = new Date(complaint.updatedAt);
      return acc + Math.floor((resolved - created) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / resolvedComplaints.length);
  };

  const getCategoryBreakdown = (complaints) => {
    const categories = ['sanitation', 'roads', 'water', 'electricity', 'parks', 'traffic', 'other'];
    return categories.map(category => ({
      category,
      count: complaints.filter(c => c.category === category).length
    }));
  };

  const getMonthlyTrend = (complaints) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        count: complaints.filter(c => {
          const complaintDate = new Date(c.createdAt);
          return complaintDate.getMonth() === date.getMonth() && 
                 complaintDate.getFullYear() === date.getFullYear();
        }).length
      });
    }
    
    return months;
  };

  const calculateEngagementScore = (complaints) => {
    if (complaints.length === 0) return 0;
    
    const upvotedCount = complaints.filter(c => c.upvoted).length;
    const avgUpvotes = complaints.reduce((acc, c) => acc + (c.upvotes?.length || 0), 0) / complaints.length;
    const responseRate = complaints.filter(c => c.status !== 'pending').length / complaints.length;
    
    return Math.round((upvotedCount / complaints.length * 0.4 + avgUpvotes * 0.3 + responseRate * 0.3) * 100);
  };

  const stats = calculateStats();

  const getCategoryColor = (category) => {
    const colors = {
      sanitation: 'bg-green-500',
      roads: 'bg-blue-500',
      water: 'bg-cyan-500',
      electricity: 'bg-yellow-500',
      parks: 'bg-emerald-500',
      traffic: 'bg-orange-500',
      other: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your civic engagement and complaint performance</p>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="sanitation">Sanitation</option>
            <option value="roads">Roads</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="parks">Parks</option>
            <option value="traffic">Traffic</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResolutionTime}d</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.engagementScore}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {stats.categoryBreakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)} mr-3`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(item.count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <div className="flex items-end justify-between h-32">
            {stats.monthlyTrend.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-2">{item.count}</div>
                <div
                  className="bg-indigo-600 rounded-t w-8"
                  style={{ height: `${(item.count / Math.max(...stats.monthlyTrend.map(m => m.count))) * 80}px` }}
                ></div>
                <div className="text-xs text-gray-500 mt-2">{item.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 