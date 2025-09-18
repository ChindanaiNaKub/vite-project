<script setup lang="ts">
import type { Organization } from '@/types'
import { ref, onMounted } from 'vue'
import OrganizationService from '@/services/OrganizationService'
import { useRouter } from 'vue-router'

const organizations = ref<Organization[]>([])
const router = useRouter()

onMounted(() => {
  // Try to load organizations, but handle the case where the backend endpoint doesn't exist yet
  OrganizationService.getOrganizations(10, 1)
    .then((response) => {
      organizations.value = response.data
    })
    .catch((error) => {
      console.log('Organizations endpoint not available yet:', error.message)
      // Don't redirect to error page, just show empty list with message
    })
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
      <div 
        v-for="organization in organizations" 
        :key="organization.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ organization.name }}</h3>
        <p class="text-gray-600 mb-3">{{ organization.description }}</p>
        
        <div class="space-y-2 text-sm text-gray-500">
          <p><span class="font-medium">Contact:</span> {{ organization.contactPerson }}</p>
          <p><span class="font-medium">Email:</span> {{ organization.email }}</p>
          <p v-if="organization.phone"><span class="font-medium">Phone:</span> {{ organization.phone }}</p>
          <p v-if="organization.website">
            <span class="font-medium">Website:</span> 
            <a :href="organization.website" target="_blank" class="text-blue-500 hover:underline">
              {{ organization.website }}
            </a>
          </p>
          <p v-if="organization.establishedDate">
            <span class="font-medium">Established:</span> {{ organization.establishedDate }}
          </p>
        </div>
      </div>
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
