<script setup lang="ts">
import Uploader from 'vue-media-upload'
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

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
    // Get the URL - backend response puts Firebase URL in 'name' field
    const imageUrl = element.name || element.url
    
    console.log('Processing image URL:', imageUrl)
    
    // CRITICAL FIX: Skip blob URLs - they're temporary preview URLs that don't persist
    if (imageUrl && imageUrl.startsWith('blob:')) {
      console.warn('⚠️ Skipping blob URL (temporary):', imageUrl)
      console.log('ℹ️ Upload should complete and provide Firebase URL')
      return // Don't add blob URLs to the output
    }
    
    // Only add real HTTP/HTTPS URLs (Firebase URLs from backend)
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      console.log('✅ Adding permanent Firebase URL:', imageUrl)
      output.push(imageUrl)
    } else if (imageUrl) {
      console.warn('⚠️ Unexpected URL format:', imageUrl)
    }
  })
  
  console.log('📦 Final URLs to emit:', output)
  return output
}

const media = ref<MediaFile[]>(convertStringToMedia(props.modelValue))
const uploadUrl = ref(import.meta.env.VITE_UPLOAD_URL)
const uploadError = ref(false)

const authorizeHeader = computed(() => {
  // DON'T send Authorization header for upload endpoints
  // The backend should allow uploads without authentication
  console.log('Not sending Authorization header for upload (endpoint should be public)')
  return {}
})

watch(
  () => props.modelValue,
  (value) => {
    media.value = convertStringToMedia(value ?? [])
  },
  { deep: true }
)

// Watch for auth token changes
watch(
  () => authStore.token,
  (newToken) => {
    console.log('Auth token changed:', newToken ? 'Token present' : 'Token missing')
  }
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

const errorMessage = ref('')
const showLogoutButton = ref(false)
const allowContinueWithoutImages = ref(false)

const onUploadError = (error: any) => {
  console.error('Upload error details:', {
    error,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    headers: error?.config?.headers,
    config: error?.config
  })
  uploadError.value = true
  allowContinueWithoutImages.value = true
  
  // Set more specific error message
  if (error?.response?.status === 403 || error?.response?.status === 401) {
    errorMessage.value = 'Upload failed - Backend security configuration issue. The upload endpoint needs to allow anonymous access. Check BACKEND_FIX_STEPS.md for the solution.'
    showLogoutButton.value = false
  } else if (error?.response?.status === 404) {
    errorMessage.value = 'Upload endpoint not found. Please check if your backend server is running.'
  } else if (error?.response?.status === 413) {
    errorMessage.value = 'File is too large. Please choose a smaller image.'
  } else if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    errorMessage.value = 'Upload timed out. Please try again with a smaller file.'
  } else if (!uploadUrl.value || uploadUrl.value === 'undefined') {
    errorMessage.value = 'Upload service is not configured.'
  } else if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
    errorMessage.value = 'Cannot connect to upload server. Please check if the backend is running.'
  } else {
    errorMessage.value = `Image upload failed: ${error?.response?.status || error?.message || 'Unknown error'}`
  }
  
  // Don't emit empty array - keep existing images if any
  // emit('update:modelValue', [])
}

const continueWithoutImages = () => {
  uploadError.value = false
  errorMessage.value = ''
  showLogoutButton.value = false
  allowContinueWithoutImages.value = false
  media.value = []
  emit('update:modelValue', [])
}

const handleLogout = () => {
  authStore.logout()
  window.location.href = '/login'
}

onMounted(() => {
  console.log('=== ImageUpload Debug Info ===')
  console.log('Upload URL:', uploadUrl.value)
  console.log('Authorization header:', authorizeHeader.value)
  console.log('Current origin:', window.location.origin)
  console.log('Expected backend:', import.meta.env.VITE_BACKEND_URL)
  console.log('Note: Upload endpoint should be PUBLIC (no auth required)')
  console.log('==============================')
})
</script>

<template>
  <div>
    <div v-if="uploadUrl && uploadUrl !== 'undefined'">
      <div v-if="uploadError" class="p-4 border-2 border-dashed border-red-300 rounded-lg text-center mb-4">
        <p class="text-red-500 font-semibold">{{ errorMessage }}</p>
        <p class="text-sm text-red-400 mt-2">You can continue without images or try again</p>
        <div class="flex gap-2 justify-center mt-3 flex-wrap">
          <button @click="uploadError = false; errorMessage = ''; showLogoutButton = false" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
          <button v-if="allowContinueWithoutImages" @click="continueWithoutImages" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Continue Without Images
          </button>
          <button v-if="showLogoutButton" @click="handleLogout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Log Out & Refresh
          </button>
        </div>
      </div>
      <div v-else>
        <Uploader 
          :server="uploadUrl" 
          @change="onChanged"
          @upload-error="onUploadError"
          :media="media"
          :headers="authorizeHeader"
          :timeout="30000"
          field-name="image"
        ></Uploader>
      </div>
    </div>
    <div v-else class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <p class="text-gray-500">Image upload service is not available</p>
      <p class="text-sm text-gray-400">You can continue without images for now</p>
    </div>
  </div>
</template>