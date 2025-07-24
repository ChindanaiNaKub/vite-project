<script lang="ts" setup>
import { ref, onMounted, defineProps } from 'vue';
import type { Event } from '@/types'
import EventService from '@/services/EventService'
const event = ref<Event | null>(null);
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
onMounted(() => {
  // fetch event ( by id ) and set local event data
  EventService.getEvent(Number(parseInt(props.id))).then(response => {
    event.value = response.data
  }).catch(error => {
    console.log(`There was an error!`, error)
  })
});
</script>

<template>
  <div v-if="event">
    <h1>{{ event.title }}</h1>
    <p>{{ event.time }} on {{ event.date }} @ {{ event.location }}</p>
    <p>{{ event.description }}</p>
    
  </div>
</template>