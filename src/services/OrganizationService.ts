// services/OrganizationService.ts
import apiClient from './AxiosClient'
import type { Organization } from '@/types'

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
