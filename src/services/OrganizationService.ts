// services/OrganizationService.ts
import axios from 'axios'
import type { Organization } from '@/types'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
})

export default {
  getOrganizations(perPage: number, page: number) {
    return apiClient.get('/organizations', { params: { _limit: perPage, _page: page } })
  },
  getOrganization(id: number) {
    return apiClient.get(`/organizations/${id}`)
  },
  saveOrganization(organization: Organization) {
    // Remove the ID field as the backend will generate it
    const { id, ...organizationWithoutId } = organization
    const payload = {
      ...organizationWithoutId,
      images: organizationWithoutId.images ?? []
    }
    return apiClient.post('/organizations', payload)
  }
}
