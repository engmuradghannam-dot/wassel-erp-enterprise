import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  try {
    const raw = sessionStorage.getItem('erp-auth')
    if (raw) {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = 'Bearer ' + token
    }
  } catch {}
  return config
}, err => Promise.reject(err))

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message
    if (err.response?.status === 401) {
      sessionStorage.removeItem('erp-auth')
      window.location.href = '/login'
    } else if (err.response?.status === 403) {
      toast.error('ليس لديك صلاحية للقيام بهذا الإجراء')
    } else if (err.response?.status >= 500) {
      toast.error('خطأ في الخادم — يرجى المحاولة مجدداً')
    }
    return Promise.reject(err)
  }
)

export default api
