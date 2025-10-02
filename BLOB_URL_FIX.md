# Blob URL Issue - Permanent Fix

## 🐛 The Problem

**Images are saved as blob URLs instead of Firebase URLs**

From your console:
```
Using images[0] for sdf: blob:http://localhost:5173/1b55dfa3-76cd-42be-8747-4a947a426add
Using images[0] for why: blob:http://localhost:5173/7e7009ed-6077-4404-a93b-85941e6ee698
```

**Why this happens:**
1. You upload an image to your backend
2. Backend uploads to Firebase and returns Firebase URL
3. `vue-media-upload` component creates a **blob URL** for preview
4. The blob URL gets saved to database instead of the Firebase URL
5. When you refresh, blob URLs are invalid → images disappear

## ✅ The Solution

We need to make sure the **Firebase URL** (not the blob URL) is saved to the database.

### Option 1: Fix the Upload Response Handling (Recommended)

The `vue-media-upload` Uploader expects a specific response format. We need to ensure it's using the Firebase URL from the backend response.

**Your backend should return:**
```json
{
  "name": "https://firebasestorage.googleapis.com/v0/b/your-bucket/o/image.jpg?token=..."
}
```

**Update ImageUpload.vue:**

```vue
<script setup lang="ts">
const convertMediaToString = (media: MediaFile[]): string[] => {
  const output: string[] = []
  media.forEach((element: MediaFile) => {
    // Priority: Use 'url' from server response, NOT the blob URL
    // The 'name' field from backend contains the Firebase URL
    let imageUrl = element.name // Backend's response { "name": "firebase_url" }
    
    // IMPORTANT: Ignore blob URLs - they're temporary preview URLs
    if (imageUrl && imageUrl.startsWith('blob:')) {
      console.warn('Ignoring blob URL, waiting for server URL:', imageUrl)
      // Don't add blob URLs - wait for the server upload to complete
      return
    }
    
    // Only add real Firebase URLs
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      console.log('Adding Firebase URL:', imageUrl)
      output.push(imageUrl)
    }
  })
  return output
}

const onChanged = (files: MediaFile[]) => {
  uploadError.value = false
  const limitedFiles = limitFiles(files)
  media.value = limitedFiles
  
  // Convert media files to Firebase URLs (filtering out blob URLs)
  const stringFiles = convertMediaToString(limitedFiles)
  
  // Only emit if we have actual Firebase URLs
  if (stringFiles.length > 0) {
    console.log('Emitting Firebase URLs:', stringFiles)
    emit('update:modelValue', stringFiles)
  } else {
    console.log('Waiting for upload to complete...')
  }
}
</script>
```

### Option 2: Override with Server Response

Add a handler for successful uploads:

```vue
<script setup lang="ts">
const onUploadSuccess = (response: any, file: MediaFile) => {
  console.log('Upload success:', response)
  
  // Extract the Firebase URL from backend response
  const firebaseUrl = response.data?.name || response.name
  
  if (firebaseUrl && !firebaseUrl.startsWith('blob:')) {
    // Update the media array with the real Firebase URL
    const index = media.value.findIndex(m => m.name === file.name)
    if (index !== -1) {
      media.value[index] = {
        ...media.value[index],
        name: firebaseUrl,
        url: firebaseUrl
      }
    }
    
    // Re-emit with updated URLs
    const stringFiles = convertMediaToString(media.value)
    emit('update:modelValue', stringFiles)
  }
}
</script>

<template>
  <Uploader 
    :server="uploadUrl" 
    @change="onChanged"
    @upload-error="onUploadError"
    @upload-success="onUploadSuccess"
    :media="media"
    :headers="authorizeHeader"
    :timeout="30000"
    field-name="image"
  />
</template>
```

### Option 3: Custom Upload Handler (Most Control)

Replace the vue-media-upload component with a custom uploader:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const uploading = ref(false)
const uploadProgress = ref(0)

const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  
  uploading.value = true
  const uploadedUrls: string[] = []
  
  for (const file of Array.from(files)) {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await axios.post(
        import.meta.env.VITE_UPLOAD_URL,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            uploadProgress.value = Math.round((e.loaded * 100) / e.total!)
          }
        }
      )
      
      // Get Firebase URL from response
      const firebaseUrl = response.data.name
      console.log('Uploaded to Firebase:', firebaseUrl)
      
      if (firebaseUrl && !firebaseUrl.startsWith('blob:')) {
        uploadedUrls.push(firebaseUrl)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      onUploadError(error)
    }
  }
  
  // Emit the real Firebase URLs
  emit('update:modelValue', [...props.modelValue, ...uploadedUrls])
  uploading.value = false
  uploadProgress.value = 0
}
</script>

<template>
  <div class="custom-uploader">
    <input 
      type="file" 
      @change="handleFileSelect" 
      accept="image/*"
      multiple
      :disabled="uploading"
    />
    
    <div v-if="uploading" class="progress">
      <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      <span>Uploading... {{ uploadProgress }}%</span>
    </div>
    
    <!-- Preview uploaded images -->
    <div v-if="props.modelValue.length > 0" class="preview">
      <div v-for="(url, index) in props.modelValue" :key="index" class="preview-item">
        <img :src="url" alt="Uploaded" />
        <button @click="removeImage(index)">×</button>
      </div>
    </div>
  </div>
</template>
```

## 🔧 Immediate Fix

Update your `ImageUpload.vue` component right now:

```typescript
// src/components/ImageUpload.vue
const convertMediaToString = (media: MediaFile[]): string[] => {
  const output: string[] = []
  media.forEach((element: MediaFile) => {
    // Get the URL - prefer 'name' from backend response
    let imageUrl = element.name || element.url
    
    console.log('Processing image URL:', imageUrl)
    
    // CRITICAL: Skip blob URLs - they're temporary
    if (imageUrl && imageUrl.startsWith('blob:')) {
      console.warn('⚠️ Skipping blob URL (temporary):', imageUrl)
      console.log('ℹ️ Waiting for Firebase URL from server...')
      return // Don't add blob URLs to the output
    }
    
    // Only add real HTTP/HTTPS URLs (Firebase URLs)
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
      console.log('✅ Adding permanent Firebase URL:', imageUrl)
      output.push(imageUrl)
    } else {
      console.warn('⚠️ Invalid URL format:', imageUrl)
    }
  })
  
  console.log('Final URLs to save:', output)
  return output
}
```

## 🧪 Test the Fix

1. **Clear old blob URLs from database:**
   ```sql
   UPDATE organization 
   SET images = NULL 
   WHERE images LIKE '%blob:%';
   ```

2. **Create a new organization** with images

3. **Check the console** - you should see:
   ```
   Processing image URL: https://firebasestorage.googleapis...
   ✅ Adding permanent Firebase URL: https://...
   Final URLs to save: ["https://firebasestorage..."]
   ```

4. **Check database** - should have Firebase URLs:
   ```sql
   SELECT name, images FROM organization ORDER BY id DESC LIMIT 1;
   ```
   
   Expected:
   ```
   images: ["https://firebasestorage.googleapis.com/..."]
   ```

5. **Refresh the page** - images should still be there!

## 📊 Verification

After the fix, your console should show:
```
✅ Processing image URL: https://firebasestorage.googleapis.com/...
✅ Adding permanent Firebase URL: https://...
✅ Final URLs to save: ["https://firebasestorage..."]
```

NOT:
```
❌ Processing image URL: blob:http://localhost:5173/...
❌ Skipping blob URL (temporary)
```

---

**Which solution do you want to implement?**
- **Option 1**: Quick fix - filter out blob URLs (easiest)
- **Option 2**: Handle upload success event (moderate)
- **Option 3**: Custom uploader (most control, more work)

Let me know and I'll implement it for you!
