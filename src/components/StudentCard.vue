<script setup lang="ts">
defineProps<{
  name: string
  surname: string
  gpa: number
}>()
</script>

<template>
  <div class="student-card">
    <h2>{{ name }} {{ surname }}</h2>
    <p>GPA: {{ gpa }}</p>
  </div>
</template>

<style scoped>
.student-card {
  border: 1px solid #39495c;
  padding: 16px;
  margin-bottom: 16px;
  width: 300px;
  text-align: center;
}
</style>
