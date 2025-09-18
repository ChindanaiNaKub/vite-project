// services/OrganizationService.ts
import axios from 'axios'
import type { Organization } from '@/types'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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
    const { id, ...organizationWithoutId } = organization;
    return apiClient.post('/organizations', organizationWithoutId)
  }
}
