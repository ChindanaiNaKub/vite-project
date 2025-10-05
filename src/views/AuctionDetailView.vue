<template>
	<div class="max-w-4xl mx-auto p-6">
		<div v-if="loading" class="text-center text-gray-500">Loading auction item...</div>
		<div v-else-if="auctionItem" class="bg-white rounded-lg shadow-md p-6">
			<!-- Header -->
			<div class="mb-6">
				<h1 class="text-3xl font-bold mb-2">{{ auctionItem.name }}</h1>
				<span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
					{{ auctionItem.type }}
				</span>
			</div>

			<!-- Description -->
			<div class="mb-6">
				<h2 class="text-xl font-semibold mb-2">Description</h2>
				<p class="text-gray-700">{{ auctionItem.description }}</p>
			</div>

			<!-- Pricing Info -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div class="bg-gray-50 p-4 rounded-md">
					<h3 class="text-sm font-medium text-gray-500 mb-1">Starting Price (Min Bid)</h3>
					<p class="text-2xl font-bold text-gray-900">
						{{ displayCurrency(auctionItem.startingPrice) }}
					</p>
				</div>
				<div v-if="auctionItem.successfulBid !== null && auctionItem.successfulBid !== undefined" 
					 class="bg-green-50 p-4 rounded-md border-2 border-green-200">
					<h3 class="text-sm font-medium text-green-700 mb-1">Successful Bid (SOLD)</h3>
					<p class="text-2xl font-bold text-green-600">
						{{ displayCurrency(auctionItem.successfulBid) }}
					</p>
				</div>
				<div v-else class="bg-blue-50 p-4 rounded-md">
					<h3 class="text-sm font-medium text-blue-700 mb-1">Status</h3>
					<p class="text-xl font-semibold text-blue-600">Active / Not Sold</p>
				</div>
			</div>

			<!-- Bids Section -->
			<div class="mb-6">
				<h2 class="text-xl font-semibold mb-4">Bid History ({{ auctionItem.bids.length }} bids)</h2>
				<div v-if="auctionItem.bids.length === 0" class="text-gray-500 text-center py-4">
					No bids yet
				</div>
				<div v-else class="space-y-2">
					<div v-for="bid in sortedBids" :key="bid.id" 
						 class="flex justify-between items-center bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition">
						<div>
							<span class="font-medium text-gray-900">{{ displayCurrency(bid.amount) }}</span>
							<span v-if="bid.bidder" class="text-sm text-gray-500 ml-2">by {{ bid.bidder }}</span>
						</div>
						<span class="text-sm text-gray-500">{{ formatDateTime(bid.datetime) }}</span>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-4 pt-4 border-t">
				<button 
					@click="goBack" 
					class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
				>
					← Back to List
				</button>
			</div>
		</div>
		<div v-else class="text-center text-gray-500">Auction item not found</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuctionService from '@/services/AuctionService'
import type { AuctionItem, AuctionItemRaw } from '@/type/AuctionItem'

const route = useRoute()
const router = useRouter()

const auctionItem = ref<AuctionItem | null>(null)
const loading = ref(true)

const sortedBids = computed(() => {
	if (!auctionItem.value) return []
	// Sort by amount descending (highest first)
	return [...auctionItem.value.bids].sort((a, b) => b.amount - a.amount)
})

function displayCurrency(v: number | null | undefined) {
	if (v === null || v === undefined || Number.isNaN(v)) return 'N/A'
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}

function formatDateTime(datetime: string) {
	try {
		const date = new Date(datetime)
		return date.toLocaleString('en-US', { 
			year: 'numeric', 
			month: 'short', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	} catch {
		return datetime
	}
}

function normalizeItem(raw: AuctionItemRaw): AuctionItem {
	const bids = Array.isArray(raw.bids) ? raw.bids : []
	const startingPrice = bids.length ? Math.min(...bids.map(b => Number(b.amount))) : null
	const successfulBid = raw.successfulBid ? Number(raw.successfulBid.amount) : null
	const name = raw.description ? raw.description.split(' ').slice(0, 3).join(' ') + '...' : `Item ${raw.id}`
	
	return {
		id: raw.id,
		name,
		description: raw.description,
		type: raw.type,
		startingPrice,
		successfulBid,
		bids
	} as AuctionItem
}

function goBack() {
	router.push({ name: 'auction-list' })
}

onMounted(async () => {
	const id = Number(route.params.id)
	if (!id || isNaN(id)) {
		router.push({ name: 'auction-list' })
		return
	}

	try {
		// Try to get by ID first
		const response = await AuctionService.getAuctionItemById(id)
		const rawItem = response.data as unknown as AuctionItemRaw
		auctionItem.value = normalizeItem(rawItem)
	} catch (error: any) {
		console.error('Failed to load auction item:', error)
		
		// Fallback: fetch all and filter (in case backend doesn't support getById)
		try {
			const response = await AuctionService.getAuctionItems(100, 1)
			const rawItems = response.data as AuctionItemRaw[]
			const found = rawItems.find(item => item.id === id)
			
			if (found) {
				auctionItem.value = normalizeItem(found)
			} else {
				console.error('Auction item not found')
			}
		} catch (fallbackError) {
			console.error('Fallback fetch also failed:', fallbackError)
			router.push({ name: 'network-error-view' })
		}
	} finally {
		loading.value = false
	}
})
</script>
