import { useAuthStore } from '@/stores/auth'

class TokenRefreshService {
  private refreshInterval: number | null = null
  private readonly REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000 // Refresh 5 minutes before expiry
  private readonly TOKEN_LIFETIME = 60 * 60 * 1000 // 1 hour in milliseconds

  startAutoRefresh() {
    // Clear any existing interval
    this.stopAutoRefresh()

    // Calculate when to refresh (1 hour - 5 minutes = 55 minutes)
    const refreshTime = this.TOKEN_LIFETIME - this.REFRESH_BEFORE_EXPIRY

    console.log(`Starting auto token refresh (will refresh every ${refreshTime / 1000 / 60} minutes)`)

    // Set up interval to refresh token periodically
    this.refreshInterval = window.setInterval(async () => {
      const authStore = useAuthStore()
      
      // Only refresh if user is logged in
      if (authStore.token && authStore.refreshToken) {
        try {
          console.log('Auto-refreshing access token...')
          await authStore.refreshAccessToken()
          console.log('Access token refreshed successfully')
        } catch (error) {
          console.error('Failed to auto-refresh token:', error)
          // The interceptor will handle logout if needed
        }
      }
    }, refreshTime)
  }

  stopAutoRefresh() {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
      console.log('Stopped auto token refresh')
    }
  }
}

export default new TokenRefreshService()
