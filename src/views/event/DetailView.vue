<script lang="ts" setup>
import { toRefs, defineProps } from 'vue';
import type { Event } from '@/types'

const props = defineProps<{
    event: Event
    id: string
}>()
const { event } = toRefs(props)
</script>

<template>
  <div v-if="event" class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">{{ event.title }} @ {{ event.location }}</h1>
    <p class="text-gray-700 leading-relaxed">{{ event.description }}</p>
    <p class="text-gray-500 text-sm">{{ event.time }} on {{ event.date }}</p>
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