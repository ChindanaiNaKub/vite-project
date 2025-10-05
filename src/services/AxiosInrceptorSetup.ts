import apiClient from '@/services/AxiosClient.js'

// Request interceptor - add auth token to requests
apiClient.interceptors.request.use(
  (request) => {
    // Skip auth header for authentication endpoints
    if (request.url?.includes('/api/v1/auth/')) {
      return request
    }
    
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

// Response interceptor - just pass through responses
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)
