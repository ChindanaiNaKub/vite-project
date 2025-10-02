<script setup lang="ts">
interface ErrorMessageProps {
  id: string
}

const props = defineProps<ErrorMessageProps>()
</script>

<template>
  <p aria-live="assertive" class="errorMessage" :id="id">
    <slot />
  </p>
</template>
