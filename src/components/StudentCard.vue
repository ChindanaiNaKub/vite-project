<script setup lang="ts">
defineProps<{
  name: string
  surname: string
  gpa: number
}>()
</script>

<template>
  <div class="border border-gray-600 p-4 mb-4 w-80 text-center">
    <h2 class="text-xl font-semibold mb-2">{{ name }} {{ surname }}</h2>
    <p class="text-gray-600">GPA: {{ gpa }}</p>
  </div>
</template>

<style scoped>
/* All styles converted to Tailwind classes */
</style>
