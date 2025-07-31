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
  <p>Edit event here</p>
  <button @click="handleEdit">Edit</button>
</template>
