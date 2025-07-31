<script lang="ts" setup>
import { useEventStore } from '@/stores/event'
import { storeToRefs } from 'pinia'

const store = useEventStore() 
const { event } = storeToRefs(store)

</script>

<template>
  <div v-if="event" class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">{{ event.title }}</h1>
    <nav class="flex space-x-6 mb-8 pb-4 border-b border-gray-200">
        <router-link :to="{name: 'event-list-view'}" class="text-gray-600 hover:text-green-600 transition-colors">Details</router-link> |
        <router-link :to="{name: 'event-register-view'}" class="text-gray-600 hover:text-green-600 transition-colors">Register</router-link> |
        <router-link :to="{name: 'event-edit-view'}" class="text-gray-600 hover:text-green-600 transition-colors">Edit</router-link>
    </nav>
    <RouterView :event="event" />
    
  </div>
</template>