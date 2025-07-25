import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, API_BASE } from '../utils/api';

const ComplaintsContext = createContext();

export const useComplaintsContext = () => {
  const context = useContext(ComplaintsContext);
  if (!context) {
    throw new Error('useComplaintsContext must be used within a ComplaintsProvider');
  }
  return context;
};

export const ComplaintsProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial mock data that will be shared between citizen and official portals
  const initialMockComplaints = [
    {
      _id: 'mock1',
      title: 'Pothole on Main Street',
      description: 'Large pothole causing traffic issues',
      category: 'infrastructure',
      severity: 'high',
      status: 'pending',
      location: { 
        address: 'Main Street, Downtown, New York, NY', 
        zone: 'downtown',
        coordinates: { lat: 40.7150, lng: -74.0080 }
      },
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
      progress: 30,
      assignedTo: 'Squad Beta',
      updates: [
        {
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          progress: 30,
          notes: 'Street light inspection completed. New bulb and wiring ordered.',
          files: ['inspection_report.pdf']
        }
      ],
      location: { 
        address: 'Oak Avenue, Residential, New York, NY', 
        zone: 'residential',
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
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
      location: { 
        address: 'Commercial District, New York, NY', 
        zone: 'commercial',
        coordinates: { lat: 40.7505, lng: -73.9934 }
      },
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      citizenId: { name: 'Mike Chen', email: 'mike@example.com' },
      attachments: [],
      upvotes: 5
    },
    {
      _id: 'mock4',
      title: 'Broken Traffic Signal',
      description: 'Traffic signal not working at intersection',
      category: 'infrastructure',
      severity: 'critical',
      status: 'pending',
      location: { 
        address: 'Industrial Zone, Factory Road, New York, NY', 
        zone: 'industrial',
        coordinates: { lat: 40.7421, lng: -73.9911 }
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      citizenId: { name: 'Alex Rodriguez', email: 'alex@example.com' },
      attachments: [],
      upvotes: 2
    },
    {
      _id: 'mock5',
      title: 'Water Leak',
      description: 'Water leaking from underground pipe',
      category: 'utilities',
      severity: 'high',
      status: 'in_progress',
      progress: 75,
      assignedTo: 'Squad Alpha',
      updates: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          progress: 75,
          notes: 'Water leak has been identified and repair work is in progress. Temporary measures implemented.',
          files: ['repair_work_photo.jpg', 'temporary_fix_report.pdf']
        },
        {
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          progress: 50,
          notes: 'Assessment completed. Parts ordered for repair.',
          files: ['assessment_report.pdf']
        }
      ],
      location: { 
        address: 'Downtown Plaza, New York, NY', 
        zone: 'downtown',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      citizenId: { name: 'Emily Brown', email: 'emily@example.com' },
      attachments: [],
      upvotes: 4
    }
  ];

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let response;
      if (token) {
        response = await api.get('/complaints', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await api.get('/public/complaints');
      }

      if (response.status !== 200) {
        if (response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to fetch complaints');
      }

      const data = response.data;
      const complaintsData = data.complaints || data;
      setComplaints(complaintsData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching complaints:', err);
      
      // Use shared mock data
      setComplaints(initialMockComplaints);
    } finally {
      setLoading(false);
    }
  };

  const createComplaint = async (complaintData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in to submit a complaint.');
      }
      
      // Prepare form data for API
      const formData = new FormData();
      formData.append('title', complaintData.title);
      formData.append('description', complaintData.description);
      formData.append('category', complaintData.category);
      formData.append('severity', complaintData.severity);
      formData.append('location', JSON.stringify(complaintData.location));
      
      // Add images if any
      if (complaintData.images && complaintData.images.length > 0) {
        complaintData.images.forEach(image => {
          formData.append('attachments', image);
        });
      }

      console.log('Sending complaint data to API:', {
        title: complaintData.title,
        description: complaintData.description,
        category: complaintData.category,
        severity: complaintData.severity,
        location: complaintData.location,
        imageCount: complaintData.images?.length || 0
      });

      const response = await api.post('/complaints', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('API Response status:', response.status);

      if (response.status !== 200 && response.status !== 201) {
        const errorData = response.data;
        console.error('API Error response:', errorData);
        throw new Error('Failed to submit complaint');
      }

      const result = response.data;
      console.log('API Success response:', result);
      
      // Backend returns { message, complaint, aiSuggestion }
      const newComplaint = result.complaint;
      
      // Add the new complaint to the shared list
      setComplaints(prev => [newComplaint, ...prev]);
      
      return newComplaint;
    } catch (err) {
      console.error('Error creating complaint:', err);
      
      // If it's a network error or server is down, create a mock complaint for demo
      if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')) {
        console.log('Creating mock complaint due to network/server error');
        
        const mockComplaint = {
          _id: `mock${Date.now()}`,
          title: complaintData.title || 'New Complaint',
          description: complaintData.description || 'Complaint description',
          category: complaintData.category || 'other',
          severity: complaintData.severity || 'medium',
          status: 'pending',
          location: complaintData.location || { 
            address: 'Unknown Location', 
            zone: 'downtown',
            coordinates: null
          },
          createdAt: new Date().toISOString(),
          citizenId: { 
            name: localStorage.getItem('userName') || 'Anonymous', 
            email: localStorage.getItem('userEmail') || 'anonymous@example.com' 
          },
          attachments: [],
          upvotes: 0,
          timeline: [
            {
              action: 'Complaint submitted',
              timestamp: new Date().toISOString(),
              comment: 'Complaint has been submitted and is pending review'
            }
          ]
        };
        
        // Add the new complaint to the shared list
        setComplaints(prev => [mockComplaint, ...prev]);
        
        return mockComplaint;
      }
      
      // Re-throw the error for the UI to handle
      throw err;
    }
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

      const response = await api.put(`/complaints/${complaintId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to update complaint status');
      }

      const result = response.data;
      
      // Update the complaint in the shared list
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, status: newStatus, timeline: result.complaint?.timeline }
            : complaint
        )
      );

      return result;
    } catch (err) {
      console.error('Error updating complaint status:', err);
      
      // If API fails, update locally for demo
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { 
                ...complaint, 
                status: newStatus,
                updatedAt: new Date().toISOString(),
                timeline: [
                  ...(complaint.timeline || []),
                  {
                    action: `Status updated to ${newStatus}`,
                    timestamp: new Date().toISOString(),
                    comment: notes,
                    files: files ? files.map(f => f.name) : []
                  }
                ]
              }
            : complaint
        )
      );
      
      throw err;
    }
  };

  // Update complaint progress (for task management)
  const updateComplaintProgress = async (complaintId, progress, notes, files) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('progress', progress);
      if (notes) formData.append('notes', notes); // FIX: use 'notes' not 'comment'
      if (files && files.length > 0) {
        // If progress is 100, send as resolutionMedia, else as progressMedia
        const field = progress >= 100 ? 'resolutionMedia' : 'progressMedia';
        files.forEach(file => {
          formData.append(field, file);
        });
      }
      const response = await api.put(`/complaints/${complaintId}/progress`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status !== 200) {
        console.error('Progress update failed:', response.status, response.data);
        throw new Error('Failed to update complaint progress');
      }
      const result = response.data;
      console.log('Progress update result:', result);
      // Update the complaint in the shared list
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { 
                ...complaint, 
                progress: progress,
                status: progress >= 100 ? 'resolved' : 'in_progress',
                updates: [
                  ...(complaint.updates || []),
                  {
                    timestamp: new Date().toISOString(),
                    progress: progress,
                    notes: notes,
                    files: files ? files.map(f => f.name) : []
                  }
                ],
                timeline: [
                  ...(complaint.timeline || []),
                  {
                    action: progress >= 100 ? 'Complaint resolved' : 'Progress updated',
                    timestamp: new Date().toISOString(),
                    comment: notes,
                    files: files ? files.map(f => f.name) : []
                  }
                ]
              }
            : complaint
        )
      );
      return result;
    } catch (err) {
      console.error('Error updating complaint progress:', err);
      // If API fails, update locally for demo
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { 
                ...complaint, 
                progress: progress,
                status: progress >= 100 ? 'resolved' : 'in_progress',
                updatedAt: new Date().toISOString(),
                updates: [
                  ...(complaint.updates || []),
                  {
                    timestamp: new Date().toISOString(),
                    progress: progress,
                    notes: notes,
                    files: files ? files.map(f => f.name) : []
                  }
                ],
                timeline: [
                  ...(complaint.timeline || []),
                  {
                    action: progress >= 100 ? 'Complaint resolved' : 'Progress updated',
                    timestamp: new Date().toISOString(),
                    comment: notes,
                    files: files ? files.map(f => f.name) : []
                  }
                ]
              }
            : complaint
        )
      );
      throw err;
    }
  };

  const upvoteComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/complaints/${complaintId}/upvote`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to upvote complaint');
      }

      const result = response.data;
      
      // Update the complaint in the shared list
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
      
      // If API fails, update locally for demo
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === complaintId 
            ? { ...complaint, upvotes: (complaint.upvotes || 0) + 1 }
            : complaint
        )
      );
      
      throw err;
    }
  };

  const getComplaint = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/complaints/${complaintId}`);

      if (response.status !== 200) {
        throw new Error('Failed to fetch complaint');
      }

      return response.data;
    } catch (err) {
      console.error('Error fetching complaint:', err);
      
      // If API fails, return from local state
      const complaint = complaints.find(c => c._id === complaintId);
      if (complaint) {
        return { complaint };
      }
      
      throw err;
    }
  };

  // Calculate stats for official dashboard
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

    return stats;
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchComplaints();
    } else {
      // If no token, just set loading to false and use empty complaints
      setLoading(false);
      setComplaints([]);
    }
  }, []);

  const value = {
    complaints,
    loading,
    error,
    stats: calculateStats(complaints),
    fetchComplaints,
    createComplaint,
    addComplaint: createComplaint, // Alias for backward compatibility
    updateComplaintStatus,
    updateComplaintProgress,
    upvoteComplaint,
    getComplaint,
    refreshComplaints: fetchComplaints,
  };

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  );
}; 