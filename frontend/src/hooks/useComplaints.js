// useComplaints.js
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const useComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      // Backend returns { complaints, totalPages, currentPage, total }
      setComplaints(data.complaints || data);
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
          attachments: [],
          upvotes: 3
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
          attachments: [],
          upvotes: 1
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
          attachments: [],
          upvotes: 5
        }
      ];
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  const createComplaint = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create complaint');
      }

      const result = await response.json();
      
      // Backend returns { message, complaint, aiSuggestion }
      const newComplaint = result.complaint;
      
      // Add the new complaint to the list
      setComplaints(prev => [newComplaint, ...prev]);
      
      return newComplaint;
    } catch (err) {
      console.error('Error creating complaint:', err);
      throw err;
    }
  };

  const upvoteComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/complaints/${complaintId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upvote complaint');
      }

      const result = await response.json();
      
      // Update the complaint in the list
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, upvotes: result.upvotes }
            : complaint
        )
      );

      return result;
    } catch (err) {
      console.error('Error upvoting complaint:', err);
      throw err;
    }
  };

  const getComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/complaints/${complaintId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaint');
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching complaint:', err);
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
    fetchComplaints,
    createComplaint,
    upvoteComplaint,
    getComplaint,
  };
};

export default useComplaints; 