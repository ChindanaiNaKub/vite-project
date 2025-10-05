<template>
	<div class="max-w-2xl mx-auto p-6">
		<h1 class="text-3xl font-bold mb-6">Create Auction Item</h1>
		<form @submit.prevent="saveAuction" class="space-y-6">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
				<textarea 
					v-model="auctionItem.description" 
					placeholder="Describe the auction item..."
					class="field w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
					rows="4"
					required
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Type/Category</label>
				<select 
					v-model="auctionItem.type" 
					class="field w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
					required
				>
					<option value="" disabled selected>Select a category...</option>
					<option v-for="category in categories" :key="category" :value="category">
						{{ category }}
					</option>
				</select>
			</div>

			<!-- Starting bid removed - backend doesn't support this field on creation -->
			<!-- Bids are added separately after the auction item is created -->

			<div class="flex gap-4">
				<button 
					type="submit" 
					class="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
				>
					Create Auction Item
				</button>
				<button 
					type="button"
					@click="goBack"
					class="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-400 transition-colors"
				>
					Cancel
				</button>
			</div>
		</form>

		<!-- Preview -->
		<div class="mt-8 p-4 bg-gray-50 rounded-md">
			<h3 class="font-semibold mb-2">Preview:</h3>
			<pre class="text-sm text-gray-600">{{ auctionItem }}</pre>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'
import AuctionService from '@/services/AuctionService'
import type { AuctionItem } from '@/type/AuctionItem'

const router = useRouter()
const store = useMessageStore()

// Available auction categories
const categories = [
	'Electronics',
	'Art',
	'Collectibles',
	'Sports',
	'Jewelry',
	'Books',
	'Furniture',
	'Vehicles',
	'Fashion',
	'Antiques',
	'Music',
	'Toys',
	'Other'
]

const auctionItem = ref<Partial<AuctionItem>>({
	description: '',
	type: ''
	// successfulBid removed - backend doesn't accept this on creation
})

function saveAuction() {
	// Only send description and type - backend doesn't accept other fields on creation
	const payload = {
		description: auctionItem.value.description,
		type: auctionItem.value.type
	}
	
	console.log('Attempting to save auction item:', payload)
	
	AuctionService.saveAuctionItem(payload)
		.then((response) => {
			console.log('Auction item saved successfully:', response.data)
			store.updateMessage(`Successfully created auction item: ${auctionItem.value.type}`)
			setTimeout(() => {
				store.restMessage()
			}, 3000)
			// Redirect to auction list
			router.push({ name: 'auction-list' })
		})
		.catch((error) => {
			console.error('Error saving auction item:', error)
			console.error('Error details:', error.response?.data)
			
			// Handle authentication errors
			if (error.response?.status === 401) {
				store.updateMessage('Your session has expired. Please log in again.')
				setTimeout(() => {
					store.restMessage()
					router.push({ name: 'login', query: { redirect: '/add-auction' } })
				}, 2000)
			} else if (error.response?.status === 403) {
				store.updateMessage('Permission denied. Unable to create auction item. Please check backend configuration.')
				setTimeout(() => {
					store.restMessage()
				}, 5000)
			} else {
				router.push({ name: 'network-error-view' })
			}
		})
}

function goBack() {
	router.push({ name: 'auction-list' })
}
</script>

<style scoped>
.field {
	width: 100%;
}
</style>
