<template>
	<div class="border rounded-md p-4 shadow hover:shadow-lg transition bg-white w-72">
		<h3 class="text-lg font-semibold mb-1">{{ item.name }}</h3>
		<p class="text-sm text-gray-600 line-clamp-3 mb-2">{{ item.description }}</p>
		<div class="text-xs text-gray-500 mb-2">Type: {{ item.type }}</div>
		<div class="flex justify-between text-sm mb-2" v-if="item.startingPrice !== null">
			<span class="font-medium">Start (min bid):</span>
			<span>{{ displayCurrency(item.startingPrice) }}</span>
		</div>
		<div v-if="item.successfulBid !== null && item.successfulBid !== undefined" class="flex justify-between text-sm mb-2 text-green-600">
			<span class="font-medium">Sold:</span>
			<span>{{ displayCurrency(item.successfulBid) }}</span>
		</div>
		<div class="text-xs text-gray-400">Bids: {{ item.bids.length }}</div>
	</div>
</template>

<script setup lang="ts">
import type { AuctionItem } from '@/type/AuctionItem'

defineProps<{ item: AuctionItem }>()

function displayCurrency(v: number | null | undefined) {
	if (v === null || v === undefined || Number.isNaN(v)) return '-'
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
}
</script>

<style scoped>
.line-clamp-3 {
	display: -webkit-box;
	-webkit-line-clamp: 3;
	line-clamp: 3; /* standard property */
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>

