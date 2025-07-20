import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const useOfficialComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    active: 0,
    resolvedToday: 0,
    overdueYellow: 0,
    overdueRed: 0
  });

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/complaints`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to fetch complaints: ${response.status}`);
      }

      const data = await response.json();
      const complaintsData = data.complaints || data;
      setComplaints(complaintsData);
      calculateStats(complaintsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching complaints:', err);
      
      // Provide mock data for demo purposes
      const mockComplaints = [
        {
          _id: 'mock1',
          title: 'Pothole on Main Street',
          description: 'Large pothole causing traffic issues',
          category: 'infrastructure',
          severity: 'high',
          status: 'pending',
          location: { address: 'Main Street, Downtown', zone: 'downtown' },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          citizenId: { name: 'John Citizen', email: 'john@example.com' },
          attachments: []
        },
        {
          _id: 'mock2',
          title: 'Street Light Out',
          description: 'Street light not working for 3 days',
          category: 'utilities',
          severity: 'medium',
          status: 'in_progress',
          location: { address: 'Oak Avenue, Residential', zone: 'residential' },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          citizenId: { name: 'Sarah Johnson', email: 'sarah@example.com' },
          attachments: []
        },
        {
          _id: 'mock3',
          title: 'Garbage Collection Issue',
          description: 'Waste bins overflowing for 5 days',
          category: 'sanitation',
          severity: 'high',
          status: 'resolved',
          location: { address: 'Commercial District', zone: 'commercial' },
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          citizenId: { name: 'Mike Chen', email: 'mike@example.com' },
          attachments: []
        },
        {
          _id: 'mock4',
          title: 'Broken Traffic Signal',
          description: 'Traffic signal not working at intersection',
          category: 'infrastructure',
          severity: 'critical',
          status: 'pending',
          location: { address: 'Industrial Zone, Factory Road', zone: 'industrial' },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          citizenId: { name: 'Alex Rodriguez', email: 'alex@example.com' },
          attachments: []
        },
        {
          _id: 'mock5',
          title: 'Water Leak',
          description: 'Water leaking from underground pipe',
          category: 'utilities',
          severity: 'high',
          status: 'in_progress',
          location: { address: 'Downtown Plaza', zone: 'downtown' },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          citizenId: { name: 'Emily Brown', email: 'emily@example.com' },
          attachments: []
        }
      ];
      setComplaints(mockComplaints);
      calculateStats(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (complaintsData) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      active: complaintsData.filter(c => c.status !== 'resolved').length,
      resolvedToday: complaintsData.filter(c => {
        if (c.status !== 'resolved' || !c.updatedAt) return false;
        const resolvedDate = new Date(c.updatedAt).toISOString().split('T')[0];
        return resolvedDate === today;
      }).length,
      overdueYellow: complaintsData.filter(c => {
        const daysOpen = getDaysOpen(c.createdAt);
        return daysOpen > 3 && daysOpen <= 7 && c.status !== 'resolved';
      }).length,
      overdueRed: complaintsData.filter(c => {
        const daysOpen = getDaysOpen(c.createdAt);
        return daysOpen > 7 && c.status !== 'resolved';
      }).length
    };

    setStats(stats);
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const updateComplaintStatus = async (complaintId, newStatus, notes, files) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('status', newStatus);
      if (notes) formData.append('comment', notes);
      
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('resolutionMedia', file);
        });
      }

      const response = await fetch(`${API_BASE}/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint status');
      }

      const result = await response.json();
      
      // Update local state
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, status: newStatus, timeline: result.complaint.timeline }
            : complaint
        )
      );

      // Recalculate stats
      const updatedComplaints = complaints.map(complaint => 
        complaint._id === complaintId 
          ? { ...complaint, status: newStatus }
          : complaint
      );
      calculateStats(updatedComplaints);

      return result;
    } catch (err) {
      console.error('Error updating complaint status:', err);
      throw err;
    }
  };

  const addResolutionNotes = async (complaintId, notes) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to add resolution notes');
      }

      const result = await response.json();
      
      // Update local state
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, timeline: result.complaint.timeline }
            : complaint
        )
      );

      return result;
    } catch (err) {
      console.error('Error adding resolution notes:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return {
    complaints,
    loading,
    error,
    stats,
    fetchComplaints,
    updateComplaintStatus,
    addResolutionNotes,
  };
};

export default useOfficialComplaints; 