import { defineStore } from 'pinia'
import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { Organizer } from '@/types'

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    refreshToken: null as string | null,
    user: null as Organizer | null,
    isRefreshing: false
  }),
  getters: {
    currentUserName(): string {
      return this.user?.name || ''
    },
    isAdmin(): boolean {
      return this.user?.roles.includes('ROLE_ADMIN') || false
    },
    authorizationHeader(): string {
      return `Bearer ${this.token}`
    }
  },
  actions: {
    login(email: string, password: string) {
      return apiClient
        .post('/api/v1/auth/authenticate', {
          username: email,
          password: password
        })
        .then((response) => {
          this.token = response.data.access_token
          this.refreshToken = response.data.refresh_token
          this.user = response.data.user
          
          // Store tokens
          localStorage.setItem('access_token', this.token as string)
          localStorage.setItem('refresh_token', this.refreshToken as string)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          return response
        })
    },
    
    register(userData: {
      username: string
      email: string
      password: string
      firstname: string
      lastname: string
    }) {
      return apiClient
        .post('/api/v1/auth/register', userData)
        .then((response) => {
          this.token = response.data.access_token
          this.refreshToken = response.data.refresh_token
          this.user = response.data.user
          
          // Store tokens
          localStorage.setItem('access_token', this.token as string)
          localStorage.setItem('refresh_token', this.refreshToken as string)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          return response
        })
    },
    
    async refreshAccessToken() {
      if (this.isRefreshing) {
        return // Already refreshing, avoid multiple calls
      }
      
      const refreshToken = this.refreshToken || localStorage.getItem('refresh_token')
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      this.isRefreshing = true
      
      try {
        const response = await apiClient.post('/api/v1/auth/refresh', {
          refresh_token: refreshToken
        })
        
        this.token = response.data.access_token
        this.refreshToken = response.data.refresh_token
        
        // Update stored tokens
        localStorage.setItem('access_token', this.token as string)
        localStorage.setItem('refresh_token', this.refreshToken as string)
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        this.isRefreshing = false
        return response
      } catch (error) {
        this.isRefreshing = false
        // If refresh fails, logout user
        this.logout()
        throw error
      }
    },
    
    logout() {
      console.log('logout')
      this.token = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
    },
    
    reload(token: string, user: Organizer) {
      this.token = token
      this.refreshToken = localStorage.getItem('refresh_token')
      this.user = user
    }
  }
})
