<script setup lang="ts">
import EventCard from '@/components/EventCard.vue'
import EventMeta from '@/components/EventMeta.vue'
import type { Event } from '@/type/Event'
import type { Student } from '@/type/Student'
import { ref, onMounted } from 'vue'
import EventService from '@/services/EventService'
import StudentService from '@/services/StudentService'

const events = ref<Event[]>([])
const students = ref<Student[]>([])

onMounted(() => {
  EventService.getEvents()
    .then((response) => {
      events.value = response.data
    })
    .catch((error) => {
      console.error('There was an error!', error)
    })
  StudentService.getStudents()
    .then((response) => {
      students.value = response.data
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
  <div class="students">
    <StudentCard v-for="student in students" :key="student.id" :student="student" />
  </div>
</template>

<style scoped>
.events {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
