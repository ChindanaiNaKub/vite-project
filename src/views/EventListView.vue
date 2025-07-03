<script setup lang="ts">
import EventCard from '@/components/EventCard.vue'
import EventMeta from '@/components/EventMeta.vue'
import type { Event } from '@/types'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const events = ref<Event[]>([])

onMounted(() => {
  axios
    .get('https://my-json-server.typicode.com/ChindanaiNaKub/vite-project/events')
    .then((response) => {
      console.log(response.data)
    })
    .catch((error) => {
      console.error('There was an error!', error)
    })
})
</script>

<template>
  <h1>Events for Good</h1>
  <!--- new element-->
  <div class="events">
    <div v-for="event in events" :key="event.id">
      <EventMeta :category="event.category" :organizer="event.organizer" />
      <EventCard :event="event" />
    </div>
  </div>
</template>

<style scoped>
.events {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
