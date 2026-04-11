import type { Listing, User, Conversation, Message } from './types'

export const regions = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  'Buxoro',
  'Andijon',
  'Farg\'ona',
  'Namangan',
  'Qashqadaryo',
  'Surxondaryo',
  'Jizzax',
  'Sirdaryo',
  'Navoiy',
  'Xorazm',
  'Qoraqalpog\'iston'
]

export const districts = [
  'Mirzo Ulug\'bek',
  'Yakkasaroy',
  'Chilonzor',
  'Sergeli',
  'Yunusobod',
  'Shayxontohur',
  'Olmazor',
  'Uchtepa',
  'Bektemir',
  'Mirobod'
]

export const mockListings: Listing[] = [
  {
    id: '1',
    title: '3 xonali zamonaviy kvartira',
    price: 85000,
    currency: 'USD',
    address: 'Navoiy ko\'chasi, 12-uy',
    district: 'Mirzo Ulug\'bek',
    region: 'Toshkent shahri',
    rooms: 3,
    area: 95,
    floor: 7,
    totalFloors: 16,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    isVip: true,
    isVerified: true,
    isFavorite: false,
    propertyType: 'apartment',
    purpose: 'sale',
    createdAt: '2024-01-15',
    agent: {
      id: 'a1',
      name: 'Jamshid Karimov',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      phone: '+998 90 123 45 67',
      isOwner: false
    }
  },
  {
    id: '2',
    title: '2 xonali yangi binoda',
    price: 450,
    currency: 'USD',
    priceType: 'monthly',
    address: 'Bobur ko\'chasi, 45',
    district: 'Yakkasaroy',
    region: 'Toshkent shahri',
    rooms: 2,
    area: 65,
    floor: 4,
    totalFloors: 9,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'
    ],
    isVip: true,
    isVerified: true,
    isFavorite: true,
    propertyType: 'apartment',
    purpose: 'rent',
    createdAt: '2024-01-14',
    agent: {
      id: 'a2',
      name: 'Nodira Saidova',
      phone: '+998 91 234 56 78',
      isOwner: true
    }
  },
  {
    id: '3',
    title: 'Shinam hovli',
    price: 180000,
    currency: 'USD',
    address: 'Bog\'ishamol, 8',
    district: 'Sergeli',
    region: 'Toshkent shahri',
    rooms: 5,
    area: 280,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop'
    ],
    isVip: true,
    isVerified: false,
    isFavorite: false,
    propertyType: 'house',
    purpose: 'sale',
    createdAt: '2024-01-13',
    agent: {
      id: 'a3',
      name: 'Bekzod Alimov',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      phone: '+998 93 345 67 89',
      isOwner: false
    }
  },
  {
    id: '4',
    title: '1 xonali studio kvartira',
    price: 35000,
    currency: 'USD',
    address: 'Amir Temur shoh ko\'chasi, 100',
    district: 'Chilonzor',
    region: 'Toshkent shahri',
    rooms: 1,
    area: 42,
    floor: 12,
    totalFloors: 20,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
    ],
    isVip: false,
    isVerified: true,
    isFavorite: false,
    propertyType: 'apartment',
    purpose: 'sale',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Ofis binosi markaz',
    price: 2500,
    currency: 'USD',
    priceType: 'monthly',
    address: 'Mustaqillik maydoni, 5',
    district: 'Mirobod',
    region: 'Toshkent shahri',
    rooms: 8,
    area: 350,
    floor: 3,
    totalFloors: 5,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    ],
    isVip: false,
    isVerified: true,
    isFavorite: false,
    propertyType: 'office',
    purpose: 'rent',
    createdAt: '2024-01-11',
    agent: {
      id: 'a4',
      name: 'Sherzod Rahimov',
      phone: '+998 94 456 78 90',
      isOwner: false
    }
  },
  {
    id: '6',
    title: '4 xonali premium kvartira',
    price: 150000,
    currency: 'USD',
    address: 'Afrosiyob ko\'chasi, 25',
    district: 'Yunusobod',
    region: 'Toshkent shahri',
    rooms: 4,
    area: 145,
    floor: 15,
    totalFloors: 22,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop'
    ],
    isVip: false,
    isVerified: true,
    isFavorite: true,
    propertyType: 'apartment',
    purpose: 'sale',
    createdAt: '2024-01-10',
    agent: {
      id: 'a5',
      name: 'Dilnoza Qodirova',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      phone: '+998 95 567 89 01',
      isOwner: true
    }
  },
  {
    id: '7',
    title: '2 xonali yangilanish bilan',
    price: 55000,
    currency: 'USD',
    address: 'Oybek ko\'chasi, 78',
    district: 'Shayxontohur',
    region: 'Toshkent shahri',
    rooms: 2,
    area: 58,
    floor: 2,
    totalFloors: 5,
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop'
    ],
    isVip: false,
    isVerified: false,
    isFavorite: false,
    propertyType: 'apartment',
    purpose: 'sale',
    createdAt: '2024-01-09'
  },
  {
    id: '8',
    title: 'Katta yer uchastka',
    price: 75000,
    currency: 'USD',
    address: 'Qibray tumani',
    district: 'Qibray',
    region: 'Toshkent viloyati',
    rooms: 0,
    area: 1200,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop'
    ],
    isVip: false,
    isVerified: true,
    isFavorite: false,
    propertyType: 'land',
    purpose: 'sale',
    createdAt: '2024-01-08',
    agent: {
      id: 'a6',
      name: 'Rustam Ergashev',
      phone: '+998 97 678 90 12',
      isOwner: true
    }
  }
]

export const mockUser: User = {
  id: 'u1',
  name: 'Sardor Mahmudov',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop',
  phone: '+998 90 987 65 43',
  email: 'sardor@example.com',
  stats: {
    listings: 12,
    views: 3450,
    calls: 89,
    sales: 5
  },
  createdAt: '2023-06-15'
}

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participant: {
      id: 'p1',
      name: 'Jamshid Karimov',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      isOnline: true
    },
    lastMessage: {
      id: 'm1',
      senderId: 'p1',
      receiverId: 'u1',
      content: 'Salom, kvartira hali mavjudmi?',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      listingId: '1'
    },
    unreadCount: 2,
    listing: {
      id: '1',
      title: '3 xonali zamonaviy kvartira',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop',
      price: 85000
    }
  },
  {
    id: 'c2',
    participant: {
      id: 'p2',
      name: 'Nodira Saidova',
      isOnline: false
    },
    lastMessage: {
      id: 'm2',
      senderId: 'u1',
      receiverId: 'p2',
      content: 'Rahmat, ko\'rib chiqaman',
      timestamp: '2024-01-14T15:45:00Z',
      isRead: true
    },
    unreadCount: 0
  },
  {
    id: 'c3',
    participant: {
      id: 'p3',
      name: 'Bekzod Alimov',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      isOnline: true
    },
    lastMessage: {
      id: 'm3',
      senderId: 'p3',
      receiverId: 'u1',
      content: 'Ertaga soat 14:00 da ko\'rishamiz',
      timestamp: '2024-01-13T09:20:00Z',
      isRead: true,
      listingId: '3'
    },
    unreadCount: 0,
    listing: {
      id: '3',
      title: 'Shinam hovli',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop',
      price: 180000
    }
  }
]

export const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'p1',
    receiverId: 'u1',
    content: 'Salom, kvartira hali mavjudmi?',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: true,
    listingId: '1'
  },
  {
    id: 'm2',
    senderId: 'u1',
    receiverId: 'p1',
    content: 'Salom! Ha, hali mavjud. Qachon ko\'rmoqchisiz?',
    timestamp: '2024-01-15T10:32:00Z',
    isRead: true
  },
  {
    id: 'm3',
    senderId: 'p1',
    receiverId: 'u1',
    content: 'Bugun kechqurun bo\'ladimi? Soat 18:00 dan keyin',
    timestamp: '2024-01-15T10:35:00Z',
    isRead: true
  },
  {
    id: 'm4',
    senderId: 'u1',
    receiverId: 'p1',
    content: 'Ha, albatta. Manzilni yuboring, kutaman.',
    timestamp: '2024-01-15T10:38:00Z',
    isRead: true
  },
  {
    id: 'm5',
    senderId: 'p1',
    receiverId: 'u1',
    content: 'Navoiy ko\'chasi, 12-uy. Metro bekati yaqinida.',
    timestamp: '2024-01-15T10:40:00Z',
    isRead: false
  }
]
