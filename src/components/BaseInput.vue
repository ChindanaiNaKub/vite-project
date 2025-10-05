<script setup lang="ts">
const modelValue = defineModel()
interface BaseInputProps {
  label?: string
  type?: string
  placeholder?: string
}
const props = withDefaults(defineProps<BaseInputProps>(), {
  label: '',
  type: 'text',
  placeholder: ''
})
</script>
<template>
  <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
    {{ props.label }}
  </label>
  <input 
    class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" 
    v-bind="$attrs" 
    v-model="modelValue" 
    :type="type"
    :placeholder="placeholder || label" 
  />
</template>