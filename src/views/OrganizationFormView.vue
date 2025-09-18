<script setup lang="ts">
import type { Organization } from '@/types'
import { ref } from 'vue'
import OrganizationService from '@/services/OrganizationService'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'

const organization = ref<Organization>({
	id: 0,
	name: '',
	description: '',
	address: '',
	contactPerson: '',
	email: '',
	phone: '',
	website: '',
	establishedDate: ''
})

const router = useRouter()
const store = useMessageStore()

function saveOrganization() {
	console.log('Attempting to save organization:', organization.value);
	OrganizationService.saveOrganization(organization.value)
		.then((response) => {
			console.log('Organization saved successfully:', response.data);
			router.push({ name: 'organization-list' })
			store.updateMessage('You successfully added a new organization: ' + response.data.name)
			setTimeout(() => {
				store.restMessage()
			}, 3000)
		})
		.catch((error) => {
			console.error('Error saving organization:', error);
			console.error('Error details:', error.response?.data);
			router.push({ name: 'network-error-view' })
		})
}
</script>

<template>
	<div>
		<h1>Create an Organization</h1>
		<form @submit.prevent="saveOrganization">
			<h3>Basic Information</h3>
			<label>Organization Name</label>
			<input v-model="organization.name" type="text" placeholder="Organization Name" class="field" required />

			<label>Description</label>
			<textarea v-model="organization.description" placeholder="Organization Description" class="field" rows="3"></textarea>

			<h3>Contact Information</h3>
			<label>Address</label>
			<input v-model="organization.address" type="text" placeholder="Organization Address" class="field" />

			<label>Contact Person</label>
			<input v-model="organization.contactPerson" type="text" placeholder="Contact Person Name" class="field" required />

			<label>Email</label>
			<input v-model="organization.email" type="email" placeholder="contact@organization.com" class="field" required />

			<label>Phone</label>
			<input v-model="organization.phone" type="tel" placeholder="Phone Number" class="field" />

			<label>Website (Optional)</label>
			<input v-model="organization.website" type="url" placeholder="https://www.organization.com" class="field" />

			<h3>Additional Information</h3>
			<label>Established Date</label>
			<input v-model="organization.establishedDate" type="date" class="field" />

			<button class="button" type="submit">Create Organization</button>
		</form>
		<pre>{{ organization }}</pre>
	</div>
</template>

<style src="@/assets/form.css"></style>
