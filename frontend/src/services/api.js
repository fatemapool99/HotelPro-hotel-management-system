import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotelpro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear stored credentials
      if (localStorage.getItem('hotelpro_token')) {
        localStorage.removeItem('hotelpro_token');
        localStorage.removeItem('hotelpro_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  getAllUsers: () => api.get('/auth/users'),
};

// Rooms Endpoints
export const roomAPI = {
  getRooms: (params) => api.get('/rooms', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  checkAvailability: (id, checkIn, checkOut) =>
    api.get(`/rooms/${id}/availability`, { params: { checkIn, checkOut } }),
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Booking Endpoints
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  updateBookingStatus: (id, data) => api.put(`/bookings/admin/${id}/status`, data),
  getAdminStats: () => api.get('/bookings/admin/stats'),
};

export default api;
