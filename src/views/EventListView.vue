<script setup lang="ts">
import EventCard from '@/components/EventCard.vue'
import EventMeta from '@/components/EventMeta.vue'
import type { Event as EventType } from '@/types'
import type { Student } from '@/type/Student'
import { ref, onMounted, computed, watchEffect } from 'vue'
import EventService from '@/services/EventService'
import StudentService from '@/services/StudentService'
import { useRouter } from 'vue-router'

const events = ref<EventType[] | null>(null)
const totalEvents = ref(0)
const hasNextPage = computed(() => {
  //const totalPages = Math.ceil(totalEvents.value / pageSize.value)
  const totalPages = Math.ceil(totalEvents.value / 3)

  return page.value < totalPages
})
const props = defineProps({
  page: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
})
const page = computed(() => props.page)
const pageSize = computed(() => props.pageSize)
const students = ref<Student[]>([])
const router = useRouter()

onMounted(() => {
  watchEffect(() => {
    //EventService.getEvents(pageSize.value, page.value)
    EventService.getEvents(3, page.value)
      .then((response) => {
        events.value = response.data
        totalEvents.value = response.headers['x-total-count']
      })
      .catch((error) => {
        console.error('There was an error!', error)
      })
  })
  StudentService.getStudents()
    .then((response) => {
      students.value = response.data
    })
    .catch((error) => {
      console.error('There was an error!', error)
    })
})

function onPageSizeChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const newSize = Number(target.value)
  router.push({ name: 'event-list-view', query: { page: 1, pageSize: newSize } })
}
</script>

<template>
  <h1>Events for Good</h1>
  <!-- Page size selector -->
  <div style="margin-bottom: 1em">
    <label for="page-size-select">Events per page: </label>
    <select id="page-size-select" :value="pageSize" @change="onPageSizeChange($event)">
      <option v-for="size in [2, 3, 4, 6]" :key="size" :value="size">{{ size }}</option>
    </select>
  </div>
  <div class="flex flex-col items-center">
    <div v-for="event in events" :key="event.id">
      <EventMeta :category="event.category" :organizer="event.organizer" />
      <EventCard :event="event" />
    </div>
  </div>
  <div class="pagination"></div>
  <RouterLink
    :to="{ name: 'event-list-view', query: { page: page - 1, pageSize: pageSize } }"
    rel="prev"
    v-if="page != 1"
    >Prev Page</RouterLink
  >
  <RouterLink
    :to="{ name: 'event-list-view', query: { page: page + 1, pageSize: pageSize } }"
    rel="next"
    v-if="hasNextPage"
    >Next Page</RouterLink
  >
  <div class="students">
    <StudentCard v-for="student in students" :key="student.id" :student="student" />
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  width: 290px;
}
.pagination a {
  flex: 1;
  text-decoration: none;
  color: #2c3e50;
}
#page-prev {
  text-align: left;
}
#page-next {
  text-align: right;
}
</style>
