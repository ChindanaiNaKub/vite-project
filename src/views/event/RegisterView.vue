<script lang="ts" setup>
import { toRefs } from 'vue'
import { type Event } from '@/types'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'

const props = defineProps<{
  event: Event
  id: string
}>()
const { event } = toRefs(props)
const router = useRouter()
const store = useMessageStore()
const register = () => {
  store.updateMessage('You are successfully registered for ' + props.event.title)
  setTimeout(() => {
    store.restMessage()
  }, 3000)
  router.push({ name: 'event-detail-view', params: { id: props.id } })
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Register for Event</h1>
    <p class="text-gray-600 mb-4">Register event here</p>
    <button @click="register" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
      Register
    </button>
  </div>
</template>
