// CitizenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import useProfile from '../../hooks/useProfile';
import ComplaintCard from './ComplaintCard';
import TrendingIssues from './TrendingIssues';
import AreaStats from './AreaStats';
import ComplaintForm from './ComplaintForm';
import ResolutionNotification from './ResolutionNotification';
import { PlusCircle, User, Bell } from 'lucide-react';

const CitizenDashboard = ({ onNavigate }) => {
  const { complaints, loading, error } = useComplaintsContext();
  const { profile } = useProfile();
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [showResolutionNotification, setShowResolutionNotification] = useState(false);
  const [selectedResolvedComplaint, setSelectedResolvedComplaint] = useState(null);
  const [shownResolvedIds, setShownResolvedIds] = useState(() => {
    const stored = localStorage.getItem('shownResolvedIds');
    return stored ? JSON.parse(stored) : [];
  });

  // Check for newly resolved complaints
  useEffect(() => {
    const unseenResolved = complaints.filter(
      c =>
        c.status === 'resolved' &&
        c.updatedAt &&
        new Date(c.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) &&
        !shownResolvedIds.includes(c._id)
    );

    if (unseenResolved.length > 0) {
      setSelectedResolvedComplaint(unseenResolved[0]);
      setShowResolutionNotification(true);
    } else {
      setShowResolutionNotification(false);
      setSelectedResolvedComplaint(null);
    }
  }, [complaints, shownResolvedIds]);

  // Save shownResolvedIds to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shownResolvedIds', JSON.stringify(shownResolvedIds));
  }, [shownResolvedIds]);

  // Calculate stats
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const pending = complaints.filter(c => c.status === 'pending').length;
  const upvoted = complaints.filter(c => c.upvoted).length;

  const handleCloseResolutionNotification = () => {
    if (selectedResolvedComplaint) {
      setShownResolvedIds(ids => {
        const updated = [...ids, selectedResolvedComplaint._id];
        localStorage.setItem('shownResolvedIds', JSON.stringify(updated));
        return updated;
      });
    }
    setShowResolutionNotification(false);
    setSelectedResolvedComplaint(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Welcome{profile ? `, ${profile.name}` : ''}!</h1>
      <p className="text-gray-500 mb-6">Your citizen dashboard for civic engagement.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-indigo-600">{total}</span>
          <span className="text-gray-600">Total Complaints</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-green-600">{resolved}</span>
          <span className="text-gray-600">Resolved</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-yellow-600">{pending}</span>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
          <span className="text-2xl font-bold text-blue-600">{upvoted}</span>
          <span className="text-gray-600">Upvoted</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button 
          onClick={() => setShowComplaintForm(true)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
        >
          <PlusCircle className="h-5 w-5 mr-2" /> Submit Complaint
        </button>
        <button 
          onClick={() => onNavigate && onNavigate('profile')}
          className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-200 transition"
        >
          <User className="h-5 w-5 mr-2" /> Edit Profile
        </button>
      </div>

      {/* Community Impact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Community Impact</h2>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error loading data: {error}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {complaints.reduce((total, complaint) => total + (complaint.upvotes?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total People Affected</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {complaints.filter(c => c.upvotes?.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Issues with Community Support</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              💡 Your complaints have helped {complaints.reduce((total, complaint) => total + (complaint.upvotes?.length || 0), 0)} people in your community!
            </div>
          </div>
        )}
      </div>

      {/* Trending Issues */}
      <TrendingIssues 
        complaints={complaints} 
        onViewComplaint={(complaint) => {
          // Navigate to complaint details
          if (onNavigate) {
            onNavigate('my-complaints');
            // You might want to set the selected complaint here
          }
        }}
      />

      {/* Area Statistics */}
      <AreaStats complaints={complaints} />

      {/* Recent Complaints */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Complaints</h2>
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error loading complaints: {error}</div>
        ) : complaints.length === 0 ? (
          <div className="text-center text-gray-400">No complaints yet. Submit your first complaint!</div>
        ) : (
          <div className="grid gap-4">
            {complaints.slice(0, 5).map(complaint => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                onView={() => onNavigate && onNavigate('my-complaints')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <ComplaintForm
          onClose={() => setShowComplaintForm(false)}
          onSuccess={() => {
            setShowComplaintForm(false);
            // Optionally show a success message or refresh data
          }}
        />
      )}

      {/* Resolution Notification Popup */}
      {showResolutionNotification && selectedResolvedComplaint && (
        <ResolutionNotification
          complaint={selectedResolvedComplaint}
          onClose={handleCloseResolutionNotification}
          onRaiseNewTicket={handleCloseResolutionNotification}
        />
      )}
    </div>
  );
};

export default CitizenDashboard; 