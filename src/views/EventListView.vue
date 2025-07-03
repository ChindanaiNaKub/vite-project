<script setup lang="ts">
import EventCard from '@/components/EventCard.vue'
import EventMeta from '@/components/EventMeta.vue'
import { ref } from 'vue'
import type { Event } from '@/types'

const events = ref<Event[]>([
  {
    id: 5928101,
    category: 'animal welfare',
    title: 'Cat Adoption Day',
    description: 'Find your new feline friend at this event.',
    location: 'Meow Town',
    date: 'January 28, 2022',
    time: '12:00',
    petsAllowed: true,
  },
  {
    id: 4582797,
    category: 'food',
    title: 'Community Gardening',
    description: 'Join us as we tend to the community edible plants.',
    location: 'Flora City',
    date: 'March 14, 2022',
    time: '10:00',
    petsAllowed: true,
    organizer: 'Fern Pollin',
  },
  {
    id: 8419988,
    category: 'sustainability',
    title: 'Beach Cleanup',
    description: 'Help pick up trash along the shore.',
    location: 'Playa del Carmen',
    date: 'July 22, 2022',
    time: '11:00',
    petsAllowed: false,
    organizer: 'Carey Wales',
  },
])
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
