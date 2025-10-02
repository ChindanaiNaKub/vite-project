<script setup lang="ts">
import type { Event, Organizer } from '@/types'
import { ref, onMounted } from 'vue'
import EventService from '@/services/EventService'
import OrganizerService from '@/services/OrganizerService'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import ImageUpload from '@/components/ImageUpload.vue'
import BaseSelect from '@/components/BaseSelect.vue'

const event = ref<Event>({
	id: 0,
	category: '',
	title: '',
	description: '',
	location: '',
	date: '',
	time: '',
	petAllowed: false,
	organizer: {
		id: 0,
		name: ''
	},
	images: []
})

const router = useRouter()
const store = useMessageStore()

const organizers = ref<Organizer[]>([])

onMounted(() => {
	console.log('Fetching organizers...')
	OrganizerService.getOrganizers()
		.then((response) => {
			console.log('Organizers fetched:', response.data)
			// Extract only the essential data to avoid circular reference issues
			if (Array.isArray(response.data)) {
				organizers.value = response.data.map((org: any) => ({
					id: org.id,
					name: org.name
				}))
			}
		})
		.catch((error) => {
			console.error('Error fetching organizers:', error)
			console.error('Full error details:', error.response)
			// Temporary: Don't redirect so we can see the form
			// TODO: Fix backend to use DTOs as per lab section 6.2
			// router.push({ name: 'network-error-view' })
		})
})

function saveEvent() {
	console.log('Attempting to save event:', event.value);
	EventService.saveEvent(event.value)
		.then((response) => {
			console.log('Event saved successfully:', response.data);
			router.push({ name: 'event-detail-view', params: { id: response.data.id } })
			store.updateMessage('You are successfully add a new event for ' + response.data.title)
			setTimeout(() => {
				store.restMessage()
			}, 3000)
		})
		.catch((error) => {
			console.error('Error saving event:', error);
			console.error('Error details:', error.response?.data);
			router.push({ name: 'network-error-view' })
		})
}
</script>

<template>
	<div>
		<h1>Create an event</h1>
		<form @submit.prevent="saveEvent">
			<label>Category</label>
			<input v-model="event.category" type="text" placeholder="Category" class="field" />

			<h3>Name & describe your event</h3>
			<label>Title</label>
			<input v-model="event.title" type="text" placeholder="Title" class="field" />

			<label>Description</label>
			<input v-model="event.description" type="text" placeholder="Description" class="field" />

			<h3>Where is your event?</h3>
			<label>Location</label>
			<input v-model="event.location" type="text" placeholder="Location" class="field" />

			<h3>When is your event?</h3>
			<label>Date</label>
			<input v-model="event.date" type="text" placeholder="Date (e.g., 3rd Sept)" class="field" />

			<label>Time</label>
			<input v-model="event.time" type="text" placeholder="Time (e.g., 3.00-4.00 pm.)" class="field" />

			<h3>Who is your organizer?</h3>
			<BaseSelect v-model="event.organizer.id" :options="organizers" label="Organizer" />

			<h3>Upload images</h3>
			<ImageUpload v-model="event.images" />
			<button type="submit">Submit</button>


			<label>
				<input v-model="event.petAllowed" type="checkbox" />
				Pets Allowed
			</label>

			<button class="button" type="submit">Submit</button>
		</form>
		<pre>{{ event }}</pre>
	</div>
</template>

<style src="@/assets/form.css"></style>
