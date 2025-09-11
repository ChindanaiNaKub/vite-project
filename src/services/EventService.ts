// services/EventService.ts
import axios from 'axios'
import type { Event } from '@/types'

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
  },
  saveEvent(event: Event) {
    // Remove the ID field as the backend will generate it
    const { id, ...eventWithoutId } = event;
    return apiClient.post('/events', eventWithoutId)
  }
}