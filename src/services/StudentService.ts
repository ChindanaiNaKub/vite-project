import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://dv-student-backend-2019.appspot.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default {
  getStudents() {
    return apiClient.get('/students')
  },
}
