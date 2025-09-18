<template>
	<div class="p-4 max-w-5xl mx-auto">
		<h1 class="text-2xl font-bold mb-4">Auction Items</h1>
	    <div class="mb-4">
	      <BaseInput v-model="keyword" label="Smart Search" placeholder="Type to search description or type..." />
	      <p class="text-xs text-gray-500 mt-1">Matches in description OR type. Debounced 300ms.</p>
	    </div>
	    <div class="mb-2 text-sm text-gray-600">Showing {{ filteredItems.length }} of {{ totalCount }} total</div>
	    <div v-if="loading" class="text-gray-500">Loading...</div>
	    <div v-else class="flex flex-wrap gap-4">
	      <AuctionItemCard v-for="a in pagedItems" :key="a.id" :item="a" />
	    </div>
	    <div class="flex gap-2 mt-6" v-if="showPagination">
	      <button :disabled="page===1" @click="changePage(page-1)" class="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
	      <span class="px-2 py-1">Page {{ page }} / {{ totalPages }}</span>
	      <button :disabled="page===totalPages" @click="changePage(page+1)" class="px-3 py-1 border rounded disabled:opacity-40">Next</button>
	    </div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import AuctionItemCard from '@/components/AuctionItemCard.vue'
import AuctionService from '@/services/AuctionService'
import { useRoute, useRouter } from 'vue-router'
import type { AuctionItem, AuctionItemRaw } from '@/type/AuctionItem'

const route = useRoute()
const router = useRouter()

// Smart search keyword
const keyword = ref('')
// Reactive state
const items = ref<AuctionItem[]>([])
const allItems = ref<AuctionItem[]>([]) // Store all items for search
const totalCount = ref(0)
const perPage = ref(3) // base page size for pagination when not filtering
const loading = ref(false)

const page = ref(Number(route.query.page) || 1)

// Filter logic (client side) after initial fetch
const lowerKeyword = computed(() => keyword.value.trim().toLowerCase())
const filteredItems = computed(() => {
	if (!lowerKeyword.value) return items.value
	// When searching, filter from all items across all pages
	return allItems.value.filter(it =>
		it.description.toLowerCase().includes(lowerKeyword.value) ||
		it.type.toLowerCase().includes(lowerKeyword.value)
	)
})

// When filtering, we show all matches (no server pagination). Otherwise, paginate original list.
const showPagination = computed(() => !lowerKeyword.value && totalPages.value > 1)
const totalPages = computed(() => {
	if (lowerKeyword.value) return 1
	return Math.max(1, Math.ceil(totalCount.value / perPage.value))
})

const pagedItems = computed(() => {
	if (lowerKeyword.value) return filteredItems.value
	// When not filtering, show the current page items from server (not sliced client-side)
	return filteredItems.value
})

function buildFetchPromise() {
  // Fetch the correct page from server based on current page number
  return AuctionService.getAuctionItems(perPage.value, page.value)
}

async function fetchAllItems() {
	// Fetch all items for search functionality
	loading.value = true
	try {
		// First, get total count
		const firstPageResponse = await AuctionService.getAuctionItems(perPage.value, 1)
		const total = Number(firstPageResponse.headers['x-total-count'] || firstPageResponse.data.length)
		
		if (total <= perPage.value) {
			// All items are on first page
			allItems.value = normalizeItems(firstPageResponse.data as AuctionItemRaw[])
		} else {
			// Fetch all pages
			const totalPages = Math.ceil(total / perPage.value)
			const promises = []
			
			for (let i = 1; i <= totalPages; i++) {
				promises.push(AuctionService.getAuctionItems(perPage.value, i))
			}
			
			const responses = await Promise.all(promises)
			const allRawItems = responses.flatMap(response => response.data as AuctionItemRaw[])
			allItems.value = normalizeItems(allRawItems)
		}
	} catch (error) {
		console.error('Failed to fetch all auction items for search:', error)
		allItems.value = []
	} finally {
		loading.value = false
	}
}

function normalizeItems(rawItems: AuctionItemRaw[]): AuctionItem[] {
	return rawItems.map((raw) => {
		const bids = Array.isArray(raw.bids) ? raw.bids : []
		const startingPrice = bids.length ? Math.min(...bids.map(b => Number(b.amount))) : null
		const successfulBid = raw.successfulBid ? Number(raw.successfulBid.amount) : null
		// Derive a simple name if backend has none
		const name = raw.description ? raw.description.split(' ').slice(0,2).join(' ') : `Item ${raw.id}`
		return {
			id: raw.id,
			name,
			description: raw.description,
			type: raw.type,
			startingPrice,
			successfulBid,
			bids
		} as AuctionItem
	})
}

function fetchItems() {
	loading.value = true
	buildFetchPromise()
		.then((response) => {
			// Normalize numeric fields to numbers (backend might return strings)
			items.value = normalizeItems(response.data as AuctionItemRaw[])
			totalCount.value = Number(response.headers['x-total-count'] || response.data.length)
		})
		.catch(() => {
			console.error('Failed to load auction items')
			// Optionally navigate to network error route if defined
			// router.push({ name: 'network-error' })
		})
		.finally(() => (loading.value = false))
}

function changePage(newPage: number) {
	if (lowerKeyword.value) return // ignore pagination when filtering
	if (newPage < 1 || newPage > totalPages.value) return
	page.value = newPage
	router.replace({ query: { ...route.query, page: page.value } })
	fetchItems()
}

// Debounce smart search (fetch all items when searching)
let debounceHandle: number | undefined
watch(keyword, () => {
	if (debounceHandle) window.clearTimeout(debounceHandle)
	debounceHandle = window.setTimeout(async () => {
		if (keyword.value.trim()) {
			// User is searching - fetch all items if we haven't already
			if (allItems.value.length === 0) {
				await fetchAllItems()
			}
		} else {
			// User cleared search - return to normal pagination
			if (page.value !== 1) {
				page.value = 1
				fetchItems()
			}
		}
	}, 300)
})

onMounted(() => {
	fetchItems()
	// Pre-fetch all items for search (optional - you can remove this if you prefer lazy loading)
	fetchAllItems()
})
</script>

