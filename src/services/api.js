import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://sharppay-backend.onrender.com/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sp_token')
      window.dispatchEvent(new Event('sp_logout'))
    }
    return Promise.reject(err)
  }
)

/* ─── AUTH ─── */
export const authRegister   = (d) => api.post('/auth/register', d)
export const authVerifyOtp  = (d) => api.post('/auth/verify-otp', d)
export const authLogin      = (d) => api.post('/auth/login', d)
export const authMe         = ()  => api.get('/auth/me')
export const authSettings   = (d) => api.post('/auth/settings', d)

/* ─── KYC ─── */
// BUG FIXED: Removed manual headers. Axios will now automatically generate the required boundary string.
export const kycVerify      = (fd) => api.post('/kyc/verify', fd)
export const kycLiveness    = (fd) => api.post('/kyc/liveness', fd)

/* ─── TRANSACTIONS ─── */
export const txTransfer     = (d) => api.post('/transactions/transfer', d)
export const txList         = ()  => api.get('/transactions')
export const txResolve      = (accountNumber) => api.get(`/accounts/resolve/${accountNumber}?bankCode=SHARP_PAY`)
export const txReceipt      = (transactionId) => api.get(`/transactions/${transactionId}/receipt`)

/* ─── BILLS ─── */
export const billsPay       = (d) => api.post('/bills/pay', d)

/* ─── CARDS (Original exports kept for safety) ─── */
export const cardsCreate    = (d) => api.post('/cards/create', d)
export const cardsMyCard    = ()  => api.get('/cards/my-card')

/* ─── CARDS (New endpoints for the updated CardsPage.jsx) ─── */
export const createCard     = (d) => api.post('/cards/create', d)
export const getMyCard      = ()  => api.get('/cards/my-card')
export const freezeCard     = ()  => api.put('/cards/freeze')
export const unfreezeCard   = ()  => api.put('/cards/unfreeze')
export const disableCard    = ()  => api.put('/cards/disable')

export default api