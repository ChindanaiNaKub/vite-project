<script setup lang="ts">
import Uploader from 'vue-media-upload'
import { ref, onMounted, watch } from 'vue'

interface MediaFile {
  name: string
  size?: number
  type?: string
  url?: string
  [key: string]: any
}

interface Props {
  modelValue?: string[]
  maxFiles?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxFiles: 0
})

const convertStringToMedia = (str: string[]): MediaFile[] => {
  return str.map((element: string) => {
    return {
      name: element,
      url: element // Use the string as both name and URL since it should be the Firebase URL
    }
  })
}

const emit = defineEmits(['update:modelValue'])

const convertMediaToString = (media: MediaFile[]): string[] => {
  const output: string[] = []
  media.forEach((element: MediaFile) => {
    // Try to use the URL first (which should be the Firebase URL), then fall back to name
    const imageUrl = element.url || element.name
    output.push(imageUrl)
  })
  return output
}

const media = ref<MediaFile[]>(convertStringToMedia(props.modelValue))
const uploadUrl = ref(import.meta.env.VITE_UPLOAD_URL)
const uploadError = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    media.value = convertStringToMedia(value ?? [])
  },
  { deep: true }
)

const limitFiles = (files: MediaFile[]): MediaFile[] => {
  if (props.maxFiles && props.maxFiles > 0) {
    return files.slice(0, props.maxFiles)
  }
  return files
}

const onChanged = (files: MediaFile[]) => {
  uploadError.value = false
  const limitedFiles = limitFiles(files)
  media.value = limitedFiles
  const stringFiles = convertMediaToString(limitedFiles)
  emit('update:modelValue', stringFiles)
}

const onUploadError = (error: any) => {
  console.error('Upload error:', error)
  uploadError.value = true
  // Continue with empty array on error
  emit('update:modelValue', [])
}

onMounted(() => {
  console.log('Upload URL:', uploadUrl.value)
})
</script>

<template>
  <div>
    <div v-if="uploadUrl && uploadUrl !== 'undefined'">
      <div v-if="uploadError" class="p-4 border-2 border-dashed border-red-300 rounded-lg text-center mb-4">
        <p class="text-red-500">Image upload failed or timed out</p>
        <p class="text-sm text-red-400">You can continue without images or try again</p>
        <button @click="uploadError = false" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Try Again
        </button>
      </div>
      <div v-else>
        <Uploader 
          :server="uploadUrl" 
          @change="onChanged"
          @upload-error="onUploadError"
          :media="media"
        ></Uploader>
      </div>
    </div>
    <div v-else class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <p class="text-gray-500">Image upload service is not available</p>
      <p class="text-sm text-gray-400">You can continue without images for now</p>
    </div>
  </div>
</template>