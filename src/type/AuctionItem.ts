export interface Bid {
	id: number
	amount: number
	datetime: string
	// backend does not include bidder name in sample; add optional for future
	bidder?: string
}

export interface SuccessfulBid {
	id: number
	amount: number
	datetime: string
}

// Raw shape as returned by backend (based on screenshot)
export interface AuctionItemRaw {
	id: number
	description: string
	type: string
	bids: Bid[]
	successfulBid?: SuccessfulBid
}

// Normalized shape used by UI
export interface AuctionItem {
	id: number
	name: string            // derived (e.g., first 12 chars of description or `Item {id}`)
	description: string
	type: string
	startingPrice: number | null  // derived from minimum bid amount (or null)
	successfulBid?: number | null // derived from successfulBid.amount
	bids: Bid[]
}

