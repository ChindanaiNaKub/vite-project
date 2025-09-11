<script setup lang="ts">
import { ref } from 'vue'
import { type Event } from '@/types'
// defineProps<{
//   msg: string
// }>()
// const event = ref({
//   id: 5928101,
//   category: 'animal welfare',
//   title: 'Cat Adoption Day',
//   description: 'Find your new feline friend at this event.',
//   location: 'Meow Town',
//   date: 'January 28, 2022',
//   time: '12:00',
//   petsAllowed: true,
//   organizer: 'Kat Laydee',
// })

defineProps<{
  event: Event
}>()
</script>

<template>
  <RouterLink class="no-underline text-gray-700" :to="{name: 'event-detail-view', params: {id: event.id}}">
    <div class="cursor-pointer border border-gray-600 p-5 w-64 mb-4 hover:scale-105 hover:shadow-lg transition-all duration-200">
      <h2 class="text-xl font-semibold mb-2">{{ event.title }}</h2>
      <span class="text-gray-600">@{{ event.category }} on {{ event.location }}</span>
    </div>
  <!-- <div v-if="event">
    <h1>{{ event.title }}</h1>
    <p>{{ event.time }} on {{ event.date }} @ {{ event.location }}</p>
    <p>{{ event.description }}</p>
  </div> -->
  </RouterLink>
</template>

<style scoped>
/* All styles converted to Tailwind classes */
</style>
