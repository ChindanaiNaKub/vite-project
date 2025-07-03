<script setup lang="ts">
defineProps<{
  category: string
  organizer?: string
}>()
</script>

<template>
  <div class="event-meta">
    <div class="category">{{ category }}</div>
    <div class="organizer" v-if="organizer">{{ organizer }}</div>
  </div>
</template>

<style scoped>
.event-meta {
  text-align: right;
  font-size: 16px;
  margin-bottom: 8px;
}
.category,
.organizer {
  display: block;
  font-size: 16px;
}
</style>
