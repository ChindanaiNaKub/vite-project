<script lang="ts" setup>
import { toRefs } from 'vue'
import { type Event } from '@/types'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'

const props = defineProps<{
  event: Event
  id: string
}>()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { event } = toRefs(props)
const router = useRouter()
const store = useMessageStore()

function handleEdit() {
  store.updateMessage('You are editing the event: ' + props.event.title)
  setTimeout(() => {
    store.restMessage()
  }, 3000)
  router.push({ name: 'event-detail-view', params: { id: props.id } })
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Edit Event</h1>
    <p class="text-gray-600 mb-4">Edit event here</p>
    <button @click="handleEdit" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors">
      Edit
    </button>
  </div>
</template>
