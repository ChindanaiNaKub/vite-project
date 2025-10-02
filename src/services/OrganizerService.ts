import apiClient from './AxiosClient'

export default {
  getOrganizers() {
    return apiClient.get('/organizers')
  }
}
