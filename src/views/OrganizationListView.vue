<script setup lang="ts">
import type { Organization } from '@/types'
import { ref, onMounted, onActivated } from 'vue'
import OrganizationService from '@/services/OrganizationService'

const organizations = ref<Organization[]>([])

const getImageUrl = (org: Organization): string | null => {
  // Try images array first (preferred format)
  if (org.images && Array.isArray(org.images) && org.images.length > 0) {
    const url = org.images[0]
    console.log(`Using images[0] for ${org.name}:`, url)
    return url
  }
  // Try single image field (fallback for older data)
  if (org.image && typeof org.image === 'string') {
    console.log(`Using image for ${org.name}:`, org.image)
    return org.image
  }
  console.log(`No image found for ${org.name}`)
  return null
}

const handleImageError = (event: Event, orgName: string, imageUrl: string | null) => {
  console.error(`Failed to load image for ${orgName}:`, imageUrl)
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Show parent container's fallback
  const container = img.parentElement
  if (container) {
    container.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-200"><span class="text-gray-400">🖼️ Image unavailable</span></div>'
  }
}

const loadOrganizations = () => {
  // Try to load organizations, but handle the case where the backend endpoint doesn't exist yet
  OrganizationService.getOrganizations(100, 1)
    .then((response) => {
      organizations.value = response.data
      
      // Enhanced debug logging
      console.group('📦 Organizations Loaded')
      console.log('Total count:', organizations.value.length)
      organizations.value.forEach((org, index) => {
        console.log(`[${index}] ${org.name}:`, {
          id: org.id,
          images: org.images,
          image: org.image,
          resolvedUrl: getImageUrl(org)
        })
      })
      console.groupEnd()
    })
    .catch((error) => {
      console.error('Organizations endpoint error:', error.message)
      // Don't redirect to error page, just show empty list with message
    })
}

onMounted(() => {
  loadOrganizations()
})

// Reload when the component is re-activated (navigating back to it)
onActivated(() => {
  loadOrganizations()
})
</script>

<template>
  <div class="organizations">
    <h1>Organizations</h1>
    
    <div class="flex justify-between items-center mb-6">
      <p class="text-gray-600">Manage your organizations</p>
      <router-link 
        :to="{ name: 'add-organization' }" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add New Organization
      </router-link>
    </div>

    <div v-if="organizations.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-4">No organizations found.</p>
      <p class="text-sm text-gray-400">
        Note: Make sure your backend has the organizations endpoint implemented.
      </p>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <router-link 
        v-for="organization in organizations" 
        :key="organization.id"
        :to="{ name: 'organization-detail', params: { id: organization.id } }"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow block overflow-hidden"
      >
        <div v-if="getImageUrl(organization)" class="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
          <img 
            :src="getImageUrl(organization)!" 
            :alt="`${organization.name} logo`" 
            class="object-cover w-full h-full"
            @error="(e) => handleImageError(e, organization.name, getImageUrl(organization))"
            loading="lazy"
          />
        </div>
        <div v-else class="h-40 bg-gray-200 flex items-center justify-center">
          <span class="text-gray-400 text-4xl">📷</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ organization.name }}</h3>
          <p class="text-gray-600 mb-3">{{ organization.description }}</p>
        
          <div class="space-y-2 text-sm text-gray-500">
            <p><span class="font-medium">Contact:</span> {{ organization.contactPerson }}</p>
            <p><span class="font-medium">Email:</span> {{ organization.email }}</p>
            <p v-if="organization.phone"><span class="font-medium">Phone:</span> {{ organization.phone }}</p>
            <p v-if="organization.website">
              <span class="font-medium">Website:</span> 
              <a
                :href="organization.website"
                target="_blank"
                rel="noopener"
                class="text-blue-500 hover:underline"
                @click.stop
              >
                {{ organization.website }}
              </a>
            </p>
            <p v-if="organization.establishedDate">
              <span class="font-medium">Established:</span> {{ organization.establishedDate }}
            </p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.organizations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
