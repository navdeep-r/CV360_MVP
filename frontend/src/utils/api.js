// api.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDashboardTrends = async (token) => {
  const response = await api.get('/dashboard/trends', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}; 