import apiClient from './AxiosClient'

export default {
  getStudents() {
    return apiClient.get('/students')
  },
}
