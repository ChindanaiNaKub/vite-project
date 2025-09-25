<script lang="ts" setup>
import { onMounted } from 'vue'
import { useEventStore } from '@/stores/event'
import { storeToRefs } from 'pinia'

const props = defineProps({
  id: String
})

const store = useEventStore() 
const { event } = storeToRefs(store)

onMounted(() => {
  store.fetchEvent(props.id!)
})
</script>

<template>
  <div v-if="event" class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">{{ event.title }}</h1>
    <nav class="flex justify-center items-center space-x-6 mb-8 pb-4 border-b border-gray-200">
        <div class="flex items-center">
            <router-link :to="{name: 'event-list-view'}" class="text-gray-600 hover:text-green-600 transition-colors">Details</router-link>
            <span class="text-gray-400 mx-3">|</span>
        </div>
        <div class="flex items-center">
            <router-link :to="{name: 'event-register-view'}" class="text-gray-600 hover:text-green-600 transition-colors">Register</router-link>
            <span class="text-gray-400 mx-3">|</span>
        </div>
        <div class="flex items-center">
            <router-link :to="{name: 'event-edit-view'}" class="text-gray-600 hover:text-green-600 transition-colors">Edit</router-link>
        </div>
    </nav>
    <RouterView :event="event" />
    
  </div>
</template>