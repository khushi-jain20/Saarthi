import axios from 'axios';

const api = axios.create({
  baseURL:  'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true // Recommended for auth cookies
});

// Request interceptor for auth token

api.interceptors.request.use((config) => {
  // Check for the captain's token first, then the user's token
  const token = localStorage.getItem('captain_token') || localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
// --- END OF FIX ---


// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    // Store new token if returned in response
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  (error) => {
    const errorObj = {
      message: error.response?.data?.message || 
              error.message || 
              'An error occurred',
      status: error.response?.status,
      code: error.code,
      data: error.response?.data
    };

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      errorObj.message = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      errorObj.message = 'Network error. Please check your connection.';
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    console.error('API Error:', errorObj);
    return Promise.reject(errorObj);
  }
);

// API Methods
export const getSuggestions = (input) => api.get('/maps/suggestions', { params: { input } });
export const calculateFare = (pickup, destination) => api.get('/rides/get-fare', { params: { pickup, destination } });
export const createRide = (data) => api.post('/rides/create', data);
export const getUserProfile = () => api.get('/users/me');

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Validate response structure
    if (!response?.token || !response?.user) {
      throw new Error('Invalid server response structure');
    }
    
    return response;
  } catch (error) {
    // Enhance error message before re-throwing
    error.message = error.response?.data?.message || 
                   'Login failed. Please check your credentials.';
    throw error;
  }
};

export default api;