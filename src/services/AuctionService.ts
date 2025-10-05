import apiClient from './AxiosClient'
import type { AxiosResponse } from 'axios'
import type { AuctionItem } from '@/type/AuctionItem'

// Service for AuctionItem related API calls
// Assumptions:
//  - Backend endpoint base path: /auction-items
//  - Supports query params: _limit, _page, description, type
//  - Response headers include x-total-count for pagination (same pattern as events)

export default {
	getAuctionItems(perPage: number, page: number): Promise<AxiosResponse<AuctionItem[]>> {
		return apiClient.get<AuctionItem[]>(`/auction-items?_limit=${perPage}&_page=${page}`)
	},
	getAuctionItemsByDescription(description: string, perPage: number, page: number): Promise<AxiosResponse<AuctionItem[]>> {
		return apiClient.get<AuctionItem[]>(`/auction-items?description=${encodeURIComponent(description)}&_limit=${perPage}&_page=${page}`)
	},
	getAuctionItemsByType(type: string, perPage: number, page: number): Promise<AxiosResponse<AuctionItem[]>> {
		return apiClient.get<AuctionItem[]>(`/auction-items?type=${encodeURIComponent(type)}&_limit=${perPage}&_page=${page}`)
	},
	getAuctionItemsByDescriptionAndType(description: string, type: string, perPage: number, page: number): Promise<AxiosResponse<AuctionItem[]>> {
		const params: string[] = []
		if (description) params.push(`description=${encodeURIComponent(description)}`)
		if (type) params.push(`type=${encodeURIComponent(type)}`)
		params.push(`_limit=${perPage}`)
		params.push(`_page=${page}`)
		return apiClient.get<AuctionItem[]>(`/auction-items?${params.join('&')}`)
	},
	saveAuctionItem(auctionItem: Partial<AuctionItem>): Promise<AxiosResponse<AuctionItem>> {
		// Remove the ID field if present, as the backend will generate it
		const { id, ...itemWithoutId } = auctionItem as AuctionItem
		return apiClient.post<AuctionItem>('/auction-items', itemWithoutId)
	}
}

