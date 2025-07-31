import type { MessagaState } from '@/types'
import { defineStore } from 'pinia'
export const useMessageStore = defineStore('message', {
  state: (): MessagaState => ({
    message: '',
  }),
  actions: {
    updateMessage(message: string) {
      this.message = message
    },
    restMessage() {
      this.message = ''
    },
  },
})
