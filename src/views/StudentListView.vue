<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StudentService from '@/services/StudentService'
import StudentCard from '@/components/StudentCard.vue'

interface Student {
  id: number
  name: string
  surname: string
  gpa: number
}

const students = ref<Student[]>([])

onMounted(async () => {
  const response = await StudentService.getStudents()
  students.value = response.data
})
</script>

<template>
  <h1>Student List</h1>
  <div class="students">
    <StudentCard
      v-for="student in students"
      :key="student.id"
      :name="student.name"
      :surname="student.surname"
      :gpa="student.gpa"
    />
  </div>
</template>

<style scoped>
.students {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
