// services/EventService.ts
import apiClient from './AxiosClient'
import type { Event } from '@/types'

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
  },
  getEventsByKeyword(keyword: string, perPage: number, page: number) {
    return apiClient.get('/events', { 
      params: { 
        title: keyword, 
        _limit: perPage, 
        _page: page 
      } 
    })
  }
}