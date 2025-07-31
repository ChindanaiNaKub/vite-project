<script setup lang="ts">
defineProps<{
  category: string
  organizer?: string
}>()
</script>

<template>
  <div class="text-right text-base mb-2">
    <div class="block text-base">{{ category }}</div>
    <div class="block text-base" v-if="organizer">{{ organizer }}</div>
  </div>
</template>

<style scoped>
/* All styles converted to Tailwind classes */
</style>
