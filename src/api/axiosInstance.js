import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  try {
    const user = JSON.parse(localStorage.getItem('examUser'))
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  } catch {}
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('examUser')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api