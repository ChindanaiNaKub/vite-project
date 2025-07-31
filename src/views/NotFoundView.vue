<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
const props = withDefaults(
    defineProps<{
       resource: string
    }>(),
    {
        resource: 'page'
    }
)
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-6">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
        <h3 class="text-lg text-gray-700 mb-6">The {{ resource }} you are looking for is not found.</h3>
        <router-link :to="{name: 'event-list-view'}" class="text-blue-500 hover:text-blue-700 underline">Back to home</router-link>
      </div>
    </div>
</template>