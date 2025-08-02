import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  Camera, 
  FileText, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  TrendingUp,
  BarChart3,
  Activity,
  Star,
  Zap,
  Target,
  Award,
  Shield,
  MessageSquare,
  ThumbsUp,
  Eye,
  Heart,
  Flag,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  Square,
  Sparkles,
  Trophy,
  Clock4,
  Timer
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import formatDate from '../../utils/formatDate';

const ComplaintDetailView = ({ complaint, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  const [progressAnimation, setProgressAnimation] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Animate progress ring
    const timer = setTimeout(() => {
      setProgressAnimation(getProgressPercentage());
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!complaint) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-blue-500 animate-bounce" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = () => {
    switch (complaint.status) {
      case 'pending':
        return 25;
      case 'in_progress':
        return 60;
      case 'resolved':
        return 100;
      default:
        return 0;
    }
  };

  // Prepare timeline data for chart
  const timelineData = complaint.timeline ? complaint.timeline.map((entry, index) => ({
    day: index + 1,
    activity: entry.action,
    timestamp: new Date(entry.timestamp).toLocaleDateString(),
    value: index + 1
  })) : [];

  // Prepare status distribution data
  const statusData = [
    { name: 'Pending', value: complaint.status === 'pending' ? 1 : 0, fill: '#fbbf24' },
    { name: 'In Progress', value: complaint.status === 'in_progress' ? 1 : 0, fill: '#3b82f6' },
    { name: 'Resolved', value: complaint.status === 'resolved' ? 1 : 0, fill: '#10b981' }
  ];

  // Performance metrics data
  const performanceData = [
    { metric: 'Response Time', value: complaint.timeline && complaint.timeline.length > 0 
      ? Math.ceil((new Date(complaint.timeline[0].timestamp) - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24))
      : getDaysOpen(complaint.createdAt), target: 2, color: '#3b82f6' },
    { metric: 'Resolution Time', value: complaint.status === 'resolved' && complaint.timeline
      ? Math.ceil((new Date(complaint.timeline[complaint.timeline.length - 1].timestamp) - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24))
      : getDaysOpen(complaint.createdAt), target: 7, color: '#10b981' },
    { metric: 'Updates Count', value: complaint.timeline ? complaint.timeline.length : 0, target: 5, color: '#f59e0b' },
    { metric: 'Days Open', value: getDaysOpen(complaint.createdAt), target: 14, color: '#ef4444' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(complaint.status)}
                <div>
                  <h2 className="text-2xl font-bold">Complaint Details</h2>
                  <p className="text-indigo-100 text-sm">{complaint.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(complaint.severity)}`}>
                  {complaint.severity}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  #{complaint._id?.slice(-8) || 'N/A'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                {/* Enhanced Progress Ring */}
                <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressAnimation / 100)}`}
                        className="text-indigo-600 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {progressAnimation}%
                      </span>
                      <span className="text-sm text-gray-600">Complete</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      {getStatusIcon(complaint.status)}
                      <span className="text-lg font-medium text-gray-900 capitalize">
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Basic Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Title</label>
                      <p className="text-sm text-gray-900 mt-1 font-medium">{complaint.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="text-sm text-gray-900 mt-1 leading-relaxed">{complaint.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <div className="flex items-center mt-1">
                          <Target className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900 capitalize">{complaint.category}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Severity</label>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-1 border ${getSeverityColor(complaint.severity)}`}>
                          {complaint.severity}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <div className="flex items-center text-sm text-gray-900 mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {complaint.location?.address || 'No location specified'}
                      </div>
                      {complaint.location?.zone && (
                        <p className="text-xs text-gray-500 mt-1">Zone: {complaint.location.zone}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Created</label>
                        <div className="flex items-center text-sm text-gray-900 mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(complaint.createdAt)}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Days Open</label>
                        <div className="flex items-center text-sm text-gray-900 mt-1">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {getDaysOpen(complaint.createdAt)} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Citizen Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    Citizen Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{complaint.citizenId?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-600">{complaint.citizenId?.email || 'No email provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Contact Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Media Gallery */}
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-indigo-600" />
                      Citizen's Submitted Media
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {complaint.attachments.map((file, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 truncate">
                              {file.originalName || file.filename}
                            </span>
                          </div>
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Column - Enhanced Charts */}
              <div className="space-y-6">
                {/* Enhanced Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                    Status Distribution
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Enhanced Activity Timeline Chart */}
                {timelineData.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                      Activity Timeline
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="day" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#6366f1" 
                            fill="#6366f1" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Enhanced Current Status */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                  <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                    {getStatusIcon(complaint.status)}
                    <span className="ml-3 text-lg font-medium text-gray-900 capitalize">
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                  {complaint.resolutionNotes && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">Resolution Notes</span>
                      </div>
                      <p className="text-sm text-blue-800">{complaint.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Enhanced Timeline and Metrics */}
              <div className="space-y-6">
                {/* Enhanced Timeline */}
                {complaint.timeline && complaint.timeline.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                    <div className="space-y-4">
                      {complaint.timeline.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-indigo-600 rounded-full mt-2"></div>
                            {index < complaint.timeline.length - 1 && (
                              <div className="w-0.5 h-8 bg-indigo-200 ml-1.5"></div>
                            )}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(entry.timestamp)}</p>
                            {entry.comment && (
                              <p className="text-sm text-gray-600 mt-2">{entry.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Progress Metrics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Metrics</h3>
                  <div className="space-y-4">
                    {performanceData.map((metric, index) => (
                      <div key={index} className="p-4 rounded-lg border" style={{ borderColor: metric.color + '20', backgroundColor: metric.color + '08' }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">{metric.metric}</span>
                          <span className="text-sm font-bold" style={{ color: metric.color }}>
                            {metric.value}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                              backgroundColor: metric.color 
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">Target: {metric.target}</span>
                          <span className="text-xs text-gray-500">
                            {metric.value > metric.target ? (
                              <ArrowUp className="h-3 w-3 text-red-500 inline" />
                            ) : metric.value < metric.target ? (
                              <ArrowDown className="h-3 w-3 text-green-500 inline" />
                            ) : (
                              <Minus className="h-3 w-3 text-gray-500 inline" />
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Escalation Status */}
                {complaint.escalationStatus && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalation Status</h3>
                    <div className={`p-4 rounded-lg border ${
                      complaint.escalationStatus.level === 'red' 
                        ? 'bg-red-50 border-red-200' 
                        : complaint.escalationStatus.level === 'yellow'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center">
                        <Flag className={`h-5 w-5 mr-2 ${
                          complaint.escalationStatus.level === 'red' 
                            ? 'text-red-500' 
                            : complaint.escalationStatus.level === 'yellow'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`} />
                        <span className="text-sm font-medium capitalize">
                          {complaint.escalationStatus.level} Flag
                        </span>
                      </div>
                      {complaint.escalationStatus.reason && (
                        <p className="text-sm text-gray-600 mt-2">{complaint.escalationStatus.reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Timeline</h3>
                <div className="space-y-6">
                  {complaint.timeline ? complaint.timeline.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        {index < complaint.timeline.length - 1 && (
                          <div className="w-0.5 h-16 bg-indigo-200 ml-2"></div>
                        )}
                      </div>
                      <div className="flex-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{entry.action}</h4>
                          <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        {entry.comment && (
                          <p className="text-gray-700 leading-relaxed">{entry.comment}</p>
                        )}
                        <div className="flex items-center mt-3 space-x-4">
                          <span className="text-xs text-gray-500">Duration: {index > 0 ? 
                            Math.ceil((new Date(entry.timestamp) - new Date(complaint.timeline[index - 1].timestamp)) / (1000 * 60 * 60 * 24)) + ' days' : 
                            'Initial'
                          }</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No timeline data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Heatmap</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="activity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Radar</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                      <PolarRadiusAxis stroke="#6b7280" />
                      <Radar 
                        dataKey="value" 
                        stroke="#6366f1" 
                        fill="#6366f1" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceData.map((metric, index) => {
                  const Icon = [Zap, Trophy, MessageSquare, Clock4][index];
                  return (
                    <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{metric.metric}</h3>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: metric.color + '20' }}>
                          <Icon className="h-4 w-4" style={{ color: metric.color }} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-2" style={{ color: metric.color }}>
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-500">
                        Target: {metric.target}
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                              backgroundColor: metric.color 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailView; 