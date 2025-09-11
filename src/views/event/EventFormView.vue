<script setup lang="ts">
import type { Event } from '@/types'
import { ref } from 'vue'
import EventService from '@/services/EventService'
import { useRouter } from 'vue-router'

const event = ref<Event>({
	id: 0,
	category: '',
	title: '',
	description: '',
	location: '',
	date: '',
	time: '',
	petAllowed: false,
	organizer: ''
})

const router = useRouter()

function saveEvent() {
	console.log('Attempting to save event:', event.value);
	EventService.saveEvent(event.value)
		.then((response) => {
			console.log('Event saved successfully:', response.data);
			router.push({ name: 'event-detail-view', params: { id: response.data.id } })
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

			<h3>Event organizer</h3>
			<label>Organizer</label>
			<input v-model="event.organizer" type="text" placeholder="Organizer" class="field" />

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
