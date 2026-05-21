export interface Category {
  _id: string
  slug: string
  nameEn: string
  nameUr: string
  icon: string
  subcategories: { slug: string; nameEn: string; nameUr: string }[]
  baseSuggestedPrice: number
  active: boolean
  order: number
}

export interface Address {
  _id?: string
  label: string
  lat: number
  lng: number
  fullAddress: string
  landmark?: string
  isDefault?: boolean
}

export interface Customer {
  _id: string
  phone: string
  name: string
  profilePhoto: string
  addresses: Address[]
}

export interface Offer {
  _id: string
  technicianId: string
  price: number
  note: string
  status: 'pending' | 'rejected' | 'accepted' | 'expired'
  createdAt: string
}

export type OrderStatus =
  | 'searching'
  | 'assigned'
  | 'enroute'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export interface Order {
  _id: string
  customerId: string
  technicianId: string | null
  category: string
  subcategory: string
  problemDescription: string
  photos: string[]
  location: {
    type: 'Point'
    coordinates: [number, number]
    fullAddress: string
    landmark: string
  }
  customerBudget: number | null
  agreedPrice: number | null
  finalPrice: number | null
  platformCommission: number
  technicianPayout: number
  status: OrderStatus
  offers: Offer[]
  paymentMethod: 'cash' | 'jazzcash' | 'easypaisa'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  customerRating?: { stars: number; review: string; ratedAt: string }
  technicianRating?: { stars: number; review: string; ratedAt: string }
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  _id: string
  senderId: string
  senderRole: 'customer' | 'technician' | 'system'
  text: string
  imageUrl: string
  type: 'text' | 'image' | 'system'
  sentAt: string
  readAt?: string
}

export interface Chat {
  _id: string
  orderId: string
  customerId: string
  technicianId: string
  messages: ChatMessage[]
}

export interface TechnicianPreview {
  _id: string
  name: string
  profilePhoto: string
  rating: number
  ratingCount: number
}
