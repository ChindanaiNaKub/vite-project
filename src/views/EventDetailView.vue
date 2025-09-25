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
    <div class="flex flex-row flex-wrap justify-center">
      <img
        v-for="image in event.images"
        :key="image"
        :src="image"
        alt="events image"
        class="border-solid border-gray-200 border-2 rounded p-1 m-1 w-40 hover:shadow-lg"
      />
    </div>
  </div>
</template>