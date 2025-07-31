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
  const totalPages = Math.ceil(totalEvents.value / pageSize.value)

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
    EventService.getEvents(pageSize.value, page.value)
      .then((response) => {
        events.value = response.data
        totalEvents.value = response.headers['x-total-count']
      })
      .catch((error) => {
        console.error('There was an error!', error)
      })
  })
})

function onPageSizeChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const newSize = Number(target.value)
  router.push({ name: 'event-list-view', query: { page: 1, pageSize: newSize } })
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-6">Events for Good</h1>
  <!-- Page size selector -->
  <div class="mb-4">
    <label for="page-size-select" class="mr-2">Events per page: </label>
    <select id="page-size-select" :value="pageSize" @change="onPageSizeChange($event)" class="border border-gray-300 rounded px-2 py-1">
      <option v-for="size in [2, 3, 4, 6]" :key="size" :value="size">{{ size }}</option>
    </select>
  </div>
  <div class="flex flex-col items-center">
    <div v-for="event in events" :key="event.id">
      <EventMeta :category="event.category" :organizer="event.organizer" />
      <EventCard :event="event" />
    </div>
  </div>
  <div class="flex w-72 mt-6">
    <RouterLink
      :to="{ name: 'event-list-view', query: { page: page - 1, pageSize: pageSize } }"
      rel="prev"
      v-if="page != 1"
      class="flex-1 no-underline text-gray-700 text-left hover:text-green-600 transition-colors"
      >Prev Page</RouterLink
    >
    <RouterLink
      :to="{ name: 'event-list-view', query: { page: page + 1, pageSize: pageSize } }"
      rel="next"
      v-if="hasNextPage"
      class="flex-1 no-underline text-gray-700 text-right hover:text-green-600 transition-colors"
      >Next Page</RouterLink
    >
  </div>
</template>

<style scoped>
/* All styles converted to Tailwind classes */
</style>
