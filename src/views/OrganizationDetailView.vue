<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrganizationService from '@/services/OrganizationService'
import type { Organization } from '@/types'

const route = useRoute()
const router = useRouter()

const organization = ref<Organization | null>(null)
const isLoading = ref(true)
const loadError = ref('')

const loadOrganization = async () => {
  const idParam = route.params.id
  const id = Number(idParam)

  if (!id || Number.isNaN(id)) {
    isLoading.value = false
    router.replace({ name: '404-resource-view', params: { resource: 'organization' } })
    return
  }

  try {
    const response = await OrganizationService.getOrganization(id)
    organization.value = response.data
    
    // Debug: Log the organization data to see the image format
    console.log('Organization data:', response.data)
    console.log('Images:', response.data.images)
    console.log('Image:', response.data.image)
  } catch (error: any) {
    if (error?.response?.status === 404) {
      router.replace({ name: '404-resource-view', params: { resource: 'organization' } })
      return
    }
    loadError.value = 'Unable to load organization details. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrganization)
</script>

<template>
  <div class="organization-detail" v-if="!isLoading">
    <router-link :to="{ name: 'organization-list' }" class="back-link">&larr; Back to organizations</router-link>

    <div v-if="loadError" class="error">{{ loadError }}</div>

    <div v-else-if="organization" class="detail-card">
      <!-- Support both images array and single image field -->
      <div class="images-wrapper" v-if="(organization.images && organization.images.length > 0) || organization.image">
        <div class="flex flex-row flex-wrap justify-center">
          <!-- If images array exists -->
          <template v-if="organization.images && organization.images.length > 0">
            <img
              v-for="(image, index) in organization.images"
              :key="index"
              :src="image"
              :alt="`${organization.name} image ${index + 1}`"
              class="border-solid border-gray-200 border-2 rounded p-1 m-1 w-40 hover:shadow-lg"
            />
          </template>
          <!-- If single image field exists -->
          <img
            v-else-if="organization.image"
            :src="organization.image"
            :alt="`${organization.name} image`"
            class="border-solid border-gray-200 border-2 rounded p-1 m-1 w-40 hover:shadow-lg"
          />
        </div>
      </div>
      <div v-else class="image-placeholder">
        <span>No image available</span>
        <p class="text-xs text-gray-400 mt-2">Debug: images={{ organization.images }}, image={{ organization.image }}</p>
      </div>

      <div class="content">
        <h1>{{ organization.name }}</h1>
        <p class="description">{{ organization.description }}</p>

        <section class="info">
          <h2>Contact Information</h2>
          <ul>
            <li><strong>Contact Person:</strong> {{ organization.contactPerson }}</li>
            <li><strong>Email:</strong> {{ organization.email }}</li>
            <li v-if="organization.phone"><strong>Phone:</strong> {{ organization.phone }}</li>
            <li v-if="organization.website">
              <strong>Website:</strong>
              <a :href="organization.website" target="_blank" rel="noopener">{{ organization.website }}</a>
            </li>
            <li v-if="organization.address"><strong>Address:</strong> {{ organization.address }}</li>
          </ul>
        </section>

        <section v-if="organization.establishedDate" class="info">
          <h2>Established</h2>
          <p>{{ organization.establishedDate }}</p>
        </section>
      </div>
    </div>
  </div>
  <div v-else class="loading">Loading organization...</div>
</template>

<style scoped>
.organization-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
}

.loading {
  text-align: center;
  padding: 4rem 0;
  font-size: 1.125rem;
  color: #6b7280;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2563eb;
  text-decoration: none;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.error {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
}

.detail-card {
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.image-wrapper {
  height: 320px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, #e5e7eb 10px, #e5e7eb 20px);
  color: #6b7280;
  font-weight: 500;
}

.content {
  padding: 2rem 2.5rem;
}

.content h1 {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #111827;
}

.description {
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.info {
  margin-bottom: 1.75rem;
}

.info h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.info ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.info li {
  color: #374151;
}

.info a {
  color: #2563eb;
  text-decoration: none;
}

.info a:hover {
  text-decoration: underline;
}
</style>
