export type Language = 'uz' | 'ru'

export type PropertyType = 'apartment' | 'house' | 'office' | 'land' | 'commercial'

export type PropertyPurpose = 'sale' | 'rent'

export interface Listing {
  id: string
  title: string
  price: number
  currency: 'USD' | 'UZS'
  priceType?: 'monthly' | 'total'
  address: string
  district: string
  region: string
  rooms: number
  area: number
  floor?: number
  totalFloors?: number
  images: string[]
  isVip: boolean
  isVerified: boolean
  isFavorite: boolean
  propertyType: PropertyType
  purpose: PropertyPurpose
  createdAt: string
  agent?: {
    id: string
    name: string
    avatar?: string
    phone: string
    isOwner: boolean
  }
}

export interface User {
  id: string
  name: string
  avatar?: string
  phone: string
  email?: string
  stats: {
    listings: number
    views: number
    calls: number
    sales: number
  }
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
  listingId?: string
}

export interface Conversation {
  id: string
  participant: {
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }
  lastMessage: Message
  unreadCount: number
  listing?: {
    id: string
    title: string
    image: string
    price: number
  }
}

export interface SearchFilters {
  region?: string
  propertyType?: PropertyType
  purpose?: PropertyPurpose
  priceMin?: number
  priceMax?: number
  roomsMin?: number
  roomsMax?: number
  areaMin?: number
  areaMax?: number
}
