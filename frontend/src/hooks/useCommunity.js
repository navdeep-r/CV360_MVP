import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const useCommunity = () => {
  const [discussions, setDiscussions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiscussions = async (category = 'all', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE}/community/discussions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch discussions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setDiscussions(data);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message);
      }
      console.error('Error fetching discussions:', err);
      // Set empty array as fallback
      setDiscussions([]);
      
      // If it's a network error, provide some mock data for demo
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
        console.log('Using mock data due to backend connection issue');
        setDiscussions([
          {
            _id: 'mock1',
            title: 'Street Light Issues in Downtown',
            content: 'Several street lights are not working properly in the downtown area.',
            category: 'infrastructure',
            author: { name: 'John Citizen' },
            createdAt: new Date().toISOString(),
            upvotes: []
          },
          {
            _id: 'mock2',
            title: 'Community Garden Proposal',
            content: 'I think we should create a community garden in the vacant lot on Oak Street.',
            category: 'community',
            author: { name: 'Sarah Johnson' },
            createdAt: new Date().toISOString(),
            upvotes: []
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/community/events`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const createDiscussion = async (discussionData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/community/discussions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discussionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create discussion');
      }

      const newDiscussion = await response.json();
      setDiscussions(prev => [newDiscussion, ...prev]);
      return newDiscussion;
    } catch (err) {
      console.error('Error creating discussion:', err);
      throw err;
    }
  };

  const upvoteDiscussion = async (discussionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/community/discussions/${discussionId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upvote discussion');
      }

      const result = await response.json();
      
      // Update local state
      setDiscussions(prev => 
        prev.map(discussion => 
          discussion._id === discussionId 
            ? { ...discussion, upvotes: result.upvotes }
            : discussion
        )
      );

      return result;
    } catch (err) {
      console.error('Error upvoting discussion:', err);
      throw err;
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/community/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join event');
      }

      const result = await response.json();
      
      // Update local state
      setEvents(prev => 
        prev.map(event => 
          event._id === eventId 
            ? { ...event, attendees: result.attendees }
            : event
        )
      );

      return result;
    } catch (err) {
      console.error('Error joining event:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDiscussions();
    fetchEvents();
  }, []); // Empty dependency array to run only once

  return {
    discussions,
    events,
    loading,
    error,
    fetchDiscussions,
    fetchEvents,
    createDiscussion,
    upvoteDiscussion,
    joinEvent,
  };
};

export default useCommunity; 