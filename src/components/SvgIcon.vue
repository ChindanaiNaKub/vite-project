<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24"
    :class="className"
  >
    <path :d="path" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  type?: string
  path: string
  size?: number | string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'mdi',
  size: 24,
  className: ''
})
</script>
