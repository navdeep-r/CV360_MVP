// ComplaintList.jsx
import React, { useState, useMemo } from 'react';
import ComplaintCard from './ComplaintCard';
import ComplaintFilters from './ComplaintFilters';
import { useComplaintsContext } from '../../context/ComplaintsContext';
import { useAuth } from '../../App';

const ComplaintList = ({ onUpvote, onView, onNavigate }) => {
  const { complaints, loading, error, upvoteComplaint } = useComplaintsContext();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    severity: '',
    status: '',
    category: '',
    area: ''
  });

  // Filter complaints based on current filters
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      // Search filter
      if (filters.search && !complaint.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !complaint.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Severity filter
      if (filters.severity && complaint.severity !== filters.severity) {
        return false;
      }
      
      // Status filter
      if (filters.status && complaint.status !== filters.status) {
        return false;
      }
      
      // Category filter
      if (filters.category && complaint.category !== filters.category) {
        return false;
      }
      
      // Area filter (based on location)
      if (filters.area && complaint.location?.area !== filters.area) {
        return false;
      }
      
      return true;
    });
  }, [complaints, filters]);

  // Check if user has upvoted a complaint
  const hasUserUpvoted = (complaint) => {
    return complaint.upvotes?.includes(user?.userId) || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
        {onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Filters */}
      <ComplaintFilters onFilterChange={setFilters} filters={filters} />
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading complaints...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading complaints: {error}</p>
        </div>
      ) : !filteredComplaints.length ? (
        <div className="text-gray-400 text-center py-8">
          {complaints.length ? 'No complaints match your filters.' : 'No complaints found.'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredComplaints.map(complaint => (
            <ComplaintCard
              key={complaint._id}
              complaint={{
                ...complaint,
                upvoted: hasUserUpvoted(complaint)
              }}
              onUpvote={async () => {
                try {
                  await upvoteComplaint(complaint._id);
                  onUpvote?.();
                } catch (error) {
                  console.error('Error upvoting:', error);
                }
              }}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintList; 