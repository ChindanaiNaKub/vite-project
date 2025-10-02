import apiClient from '@/services/AxiosClient.js'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      request.headers['Authorization'] = 'Bearer ' + token
    }
    return request
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle expired tokens with auto-refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 (Unauthorized) and 403 (Forbidden) errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Skip auto-refresh for these endpoints
      const skipRefresh = 
        originalRequest?.url?.includes('/api/v1/auth/') ||
        originalRequest?.url?.includes('/uploadImage') ||
        originalRequest?.url?.includes('/uploadFile')
      
      if (skipRefresh) {
        return Promise.reject(error)
      }
      
      // Avoid infinite loop - don't retry if already retried
      if (originalRequest._retry) {
        console.warn('Token refresh failed, logging out...')
        const authStore = useAuthStore()
        authStore.logout()
        
        router.push({ 
          name: 'login',
          query: { 
            redirect: router.currentRoute.value.fullPath,
            message: 'Your session has expired. Please log in again.'
          }
        })
        return Promise.reject(error)
      }
      
      // Try to refresh token
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      const authStore = useAuthStore()
      
      try {
        await authStore.refreshAccessToken()
        isRefreshing = false
        processQueue()
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = authStore.authorizationHeader
        return apiClient(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError)
        
        console.warn('Token refresh failed, logging out...')
        authStore.logout()
        
        router.push({ 
          name: 'login',
          query: { 
            redirect: router.currentRoute.value.fullPath,
            message: 'Your session has expired. Please log in again.'
          }
        })
        
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
