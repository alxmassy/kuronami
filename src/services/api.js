import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://https://876e77a8dfa7.ngrok-free.app/:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);


export const getMyProfile = () => api.get('/users/me');
export const updateMyProfile = (profileData) => api.put('/users/me', profileData);
export const getAllUsers = (params) => api.get('/users', { params }); // e.g., { skill: 'photoshop' }


export const createSwap = (swapData) => api.post('/swaps', swapData);
export const getMySwaps = () => api.get('/swaps/me');
export const updateSwapStatus = (id, status) => api.put(`/swaps/${id}`, { status });
export const deleteSwap = (id) => api.delete(`/swaps/${id}`);

export default api; 