import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  getAll: () => api.get('/books'),
  getById: (bookId: string) => api.get(`/books/${bookId}`),
  update: (bookId: string, bookData: any) => api.put(`/books/${bookId}`, bookData),
};

// Transaction API calls
export const transactionAPI = {
  issue: (issueData: any) => api.post('/transactions/issue', issueData),
  return: (returnData: any) => api.post('/transactions/return', returnData),
  getAll: () => api.get('/transactions'),
  getMemberTransactions: (memberId: string) => api.get(`/transactions/member/${memberId}`),
  getOverdue: () => api.get('/transactions/overdue'),
  getById: (transactionId: string) => api.get(`/transactions/${transactionId}`),
};

export default api;
