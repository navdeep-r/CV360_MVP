import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MapPin, 
  Calendar,
  TrendingUp,
  Award,
  Star,
  Filter,
  Search,
  Plus,
  X
} from 'lucide-react';
import useCommunity from '../../hooks/useCommunity';

const CommunityHub = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', category: 'general', tags: [] });
  
  const { 
    discussions, 
    events, 
    loading, 
    error, 
    fetchDiscussions, 
    createDiscussion, 
    upvoteDiscussion, 
    joinEvent 
  } = useCommunity();

  // Mock top contributors data
  const [topContributors] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      contributions: 156,
      points: 1240,
      badge: "Community Champion"
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      contributions: 89,
      points: 890,
      badge: "Active Citizen"
    },
    {
      id: 3,
      name: "Lisa Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      contributions: 67,
      points: 720,
      badge: "Engaged Resident"
    }
  ]);

  useEffect(() => {
    fetchDiscussions(filterCategory, searchTerm);
  }, [filterCategory, searchTerm]); // Remove fetchDiscussions from dependencies

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    try {
      await createDiscussion(newDiscussion);
      setNewDiscussion({ title: '', content: '', category: 'general', tags: [] });
      setShowCreateDiscussion(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleUpvote = async (discussionId) => {
    try {
      await upvoteDiscussion(discussionId);
    } catch (error) {
      console.error('Error upvoting discussion:', error);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await joinEvent(eventId);
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };



  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
        <p className="text-gray-600">Connect with your neighbors and stay engaged with your community</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Discussions</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Events</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('discussions')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discussions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Discussions
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('leaders')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'leaders'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Community Leaders
        </button>
      </div>

      {/* Content */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="community">Community</option>
              <option value="traffic">Traffic</option>
              <option value="safety">Safety</option>
            </select>
            <button
              onClick={() => setShowCreateDiscussion(true)}
              className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </button>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading discussions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Error loading discussions: {error}</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No discussions found.</p>
              </div>
            ) : (
              discussions.map((discussion) => (
                              <div key={discussion._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {discussion.author?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{discussion.title}</h3>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full capitalize">
                          {discussion.category}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{discussion.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>by {discussion.author?.name || 'Anonymous'}</span>
                          <span>{formatDate(discussion.createdAt)}</span>
                          <span>{discussion.comments?.length || 0} comments</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpvote(discussion._id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 transition-colors"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{discussion.upvotes?.length || 0}</span>
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full capitalize">
                    {event.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {event.attendees?.length || 0}/{event.maxAttendees} attending
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                </div>
                <button
                  onClick={() => handleJoinEvent(event._id)}
                  disabled={event.attendees?.length >= event.maxAttendees}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {event.attendees?.length >= event.maxAttendees ? 'Event Full' : 'Join Event'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topContributors.map((contributor, index) => (
              <div key={contributor.id} className="bg-white rounded-lg shadow p-6 text-center">
                <div className="relative mb-4">
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="w-20 h-20 rounded-full mx-auto"
                  />
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2">
                      <Award className="h-6 w-6 text-yellow-500" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{contributor.name}</h3>
                <p className="text-sm text-indigo-600 mb-3">{contributor.badge}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contributions:</span>
                    <span className="font-medium">{contributor.contributions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Points:</span>
                    <span className="font-medium">{contributor.points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Discussion Modal */}
      {showCreateDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Discussion</h3>
              <button
                onClick={() => setShowCreateDiscussion(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDiscussion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter discussion title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newDiscussion.category}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="community">Community</option>
                  <option value="traffic">Traffic</option>
                  <option value="safety">Safety</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Share your thoughts, questions, or concerns..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateDiscussion(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub; 