import type { EventState, Event } from '@/types'
import { defineStore } from 'pinia'
import EventService from '@/services/EventService'

export const useEventStore = defineStore('event', {
  state: (): EventState => ({
    event: null,
  }),
  actions: {
    setEvent(event: Event) {
      this.event = event
    },
    fetchEvent(id: string) {
      const idInt = parseInt(id)
      return EventService.getEvent(idInt)
        .then((response) => {
          this.setEvent(response.data)
        })
        .catch((error) => {
          throw error
        })
    },
  },
})
