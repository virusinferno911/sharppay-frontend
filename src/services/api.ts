import axios from 'axios';

const BASE_URL = 'https://sharp-pay.virusinferno.xyz/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sharppay_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sharppay_token');
      localStorage.removeItem('sharppay_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data: { email: string; password: string; fullName: string; phoneNumber: string }) =>
  api.post('/auth/register', data);

export const verifyOtp = (data: { email: string; otpCode: string }) =>
  api.post('/auth/verify-otp', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const getMe = () => api.get('/auth/me');

// KYC
export const verifyKyc = (formData: FormData) =>
  api.post('/kyc/verify', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const livenessCheck = (formData: FormData) =>
  api.post('/kyc/liveness', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Transactions
export const transfer = (data: {
  receiverAccountNumber: string;
  amount: number;
  description: string;
  transactionPin: string;
}) => api.post('/transactions/transfer', data);

export const getTransactions = () => api.get('/transactions');

// Bills
export const payBill = (data: {
  billType: string;
  targetNumber: string;
  amount: number;
  transactionPin: string;
}) => api.post('/bills/pay', data);

// Cards
export const createCard = (data: { cardType: string; cardPin: string }) =>
  api.post('/cards/create', data);

export const getMyCard = () => api.get('/cards/my-card');

export default api;
