// services/EventService.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: false,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
})

export default {
  getEvents(perPage: number, page: number) {
    return apiClient.get('/events', { params: { _limit: perPage, _page: page } })
  },
  getEvent(id: number) {
    return apiClient.get(`/events/${id}`)
  }
}