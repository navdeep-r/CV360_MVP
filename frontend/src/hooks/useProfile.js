// useProfile.js
import { useState, useEffect, useContext } from 'react';

const API_BASE = 'http://localhost:5000/api';

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        setProfile(user);
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedProfile.user));
      setProfile(updatedProfile.user);
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { 
    profile, 
    setProfile, 
    loading, 
    error, 
    updateProfile,
    refetch: fetchProfile 
  };
};

export default useProfile; 