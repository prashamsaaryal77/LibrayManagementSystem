import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('library-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('library-user');
        window.localStorage.removeItem('library-token');
      }
      // Optionally redirect to login or show error
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
};

// Member API calls
export const memberAPI = {
  create: (memberData: any) => api.post('/members', memberData),
  getAll: () => api.get('/members'),
  getById: (memberId: string) => api.get(`/members/${memberId}`),
  update: (memberId: string, memberData: any) => api.put(`/members/${memberId}`, memberData),
  updateStatus: (memberId: string, status: string) => api.put(`/members/${memberId}/status`, { status }),
};

// Book API calls
export const bookAPI = {
  create: (bookData: any) => api.post('/books', bookData),
  getAll: (params?: Record<string, any>) => api.get('/books', { params }),
  search: (query: string, filters?: Record<string, any>) =>
    api.get('/books/search', { params: { query, ...(filters || {}) } }),
  getById: (bookId: string) => api.get(`/books/${bookId}`),
  update: (bookId: string, bookData: any) => api.put(`/books/${bookId}`, bookData),
};

// Transaction API calls
export const transactionAPI = {
  issue: (issueData: any) => api.post('/transactions/issue', issueData),
  borrow: (borrowData: { memberId: string; bookId: string }) => api.post('/transactions/borrow', borrowData),
  return: (returnData: any) => api.post('/transactions/return', returnData),
  returnById: (transactionId: string, returnData: any) => api.put(`/transactions/return/${transactionId}`, returnData),
  payFine: (paymentData: { memberId?: string; transactionId?: string; amount: number }) =>
    api.post('/transactions/pay-fine', paymentData),
  getAll: (params?: Record<string, any>) => api.get('/transactions', { params }),
  getMemberTransactions: (memberId: string) => api.get(`/transactions/member/${memberId}`),
  getOverdue: () => api.get('/transactions/overdue'),
  getById: (transactionId: string) => api.get(`/transactions/${transactionId}`),
};

export default api;
