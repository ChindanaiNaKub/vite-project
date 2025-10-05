import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to attach JWT token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')
    console.log('📤 Request URL:', config.url)
    console.log('📤 Request method:', config.method)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header set:', config.headers.Authorization.substring(0, 30) + '...')
    } else {
      console.warn('⚠️  No token found in localStorage!')
    }
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data)
    
    // If 401 or 403, token might be expired or invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚫 Authentication/Authorization error - Token might be expired!')
      console.error('💡 Try logging out and logging back in to get a fresh token')
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
