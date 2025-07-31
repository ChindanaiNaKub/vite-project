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
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-4">{{ event.title }}</h1>
    <p class="text-lg text-gray-600 mb-4">{{ event.time }} on {{ event.date }} @ {{ event.location }}</p>
    <p class="text-gray-700 leading-relaxed">{{ event.description }}</p>
  </div>
</template>