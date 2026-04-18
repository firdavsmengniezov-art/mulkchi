# Frontend API Integration Guide

**Mulkchi.Frontend** - Angular ilovasi uchun API integratsiya qollanmasi

---

## 📋 Barcha Controller Endpointlari (22 ta)

### 1. AUTH CONTROLLER - `/api/auth`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/refresh-token` | ❌ | Token yangilash |
| POST | `/api/auth/logout` | ✅ | Logout |
| POST | `/api/auth/forgot-password` | ❌ | Parolni unutdim |
| POST | `/api/auth/reset-password` | ❌ | Parolni tiklash |
| GET | `/api/auth/me` | ✅ | Joriy user |
| PUT | `/api/auth/profile` | ✅ | Profil yangilash |
| DELETE | `/api/auth/account` | ✅ | Hisobni o'chirish |
| GET | `/api/auth/verify-email` | ❌ | Email tasdiqlash |
| POST | `/api/auth/send-otp` | ✅ | OTP yuborish |
| POST | `/api/auth/verify-otp` | ✅ | OTP tasdiqlash |
| POST | `/api/auth/google` | ❌ | Google login |
| POST | `/api/auth/telegram` | ❌ | Telegram login |

### 2. USERS CONTROLLER - `/api/users`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/users/me` | ✅ | Joriy user |
| PUT | `/api/users/me` | ✅ | Profil yangilash |
| PUT | `/api/users/me/avatar` | ✅ | Avatar yuklash (multipart) |
| GET | `/api/users/{id}` | ❌ | User by ID |
| GET | `/api/users` | Admin | Barcha users |
| GET | `/api/users/search?q=...` | Admin | User qidiruvi |
| GET | `/api/users/statistics` | Admin | Statistika |
| POST | `/api/users` | Admin | User yaratish |
| PUT | `/api/users` | Admin | User yangilash |
| DELETE | `/api/users/{id}` | Admin | User o'chirish |

### 3. PROPERTIES CONTROLLER - `/api/properties`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/properties?page=1&pageSize=20` | ❌ | Barcha mulklar |
| GET | `/api/properties/{id}` | ❌ | Mulk detali |
| GET | `/api/properties/search?...` | ❌ | Mulk qidiruvi |
| GET | `/api/properties/featured?count=8` | ❌ | Featured mulklar |
| GET | `/api/properties/autocomplete?query=...` | ❌ | Location suggestions |
| GET | `/api/properties/{id}/similar?count=6` | ❌ | O'xshash mulklar |
| POST | `/api/properties` | Host/Admin | Mulk yaratish |
| PUT | `/api/properties/{id}` | Host/Admin | Mulk yangilash |
| DELETE | `/api/properties/{id}` | Host/Admin | Mulk o'chirish |

**Search Query Params:**
- `location`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `propertyType`, `amenities`, `availableFrom`, `availableTo`

### 4. FAVORITES CONTROLLER - `/api/favorites`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/favorites?page=1&pageSize=20` | ✅ | Sevimli mulklar |
| POST | `/api/favorites` | ✅ | Sevimlilarga qo'shish (body: { propertyId }) |
| DELETE | `/api/favorites/{id}` | ✅ | Sevimlidan o'chirish |

> ⚠️ **Eslatma:** `isFavorite` tekshiruvi `GET /api/favorites` dan olingan ro'yxat orqali amalga oshiriladi.

### 5. BOOKINGS CONTROLLER - `/api/bookings`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/bookings` | Admin | Barcha bronlar |
| GET | `/api/bookings/my` | ✅ | Mening bronlarim |
| GET | `/api/bookings/host` | Host/Admin | Host bronlari |
| GET | `/api/bookings/{id}` | ✅ | Bron detali |
| POST | `/api/bookings` | ✅ | Bron yaratish |
| POST | `/api/bookings/{id}/confirm` | Host | Bronni tasdiqlash |
| POST | `/api/bookings/{id}/cancel` | ✅ | Bronni bekor qilish |
| PUT | `/api/bookings` | ✅ | Bron yangilash |
| DELETE | `/api/bookings/{id}` | ✅ | Bron o'chirish |
| GET | `/api/bookings/availability/{propertyId}?year=2024&month=4` | ❌ | Bandlik kalendar |
| POST | `/api/bookings/hold` | ✅ | Vaqtinchalik hold (10 daqiqa) |
| DELETE | `/api/bookings/hold/{holdId}` | ✅ | Holdni bekor qilish |

### 6. PAYMENTS CONTROLLER - `/api/payments`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/payments` | Admin | Barcha to'lovlar |
| GET | `/api/payments/my` | ✅ | Mening to'lovlarim |
| GET | `/api/payments/{id}` | ✅ | To'lov detali |
| GET | `/api/payments/booking/{bookingId}` | ✅ | Bron to'lovi |
| GET | `/api/payments/summary` | ✅ | To'lov summary |
| POST | `/api/payments` | ✅ | To'lov yaratish |
| PUT | `/api/payments` | Admin | To'lov yangilash |
| PUT | `/api/payments/{id}/cancel` | ✅ | To'lovni bekor qilish |
| DELETE | `/api/payments/{id}` | Admin | To'lov o'chirish |

> 💡 **Payme/Click integratsiyasi:** Webhook endpointlari `/api/payme` va `/api/click` orqali amalga oshiriladi.

### 7. MESSAGES CONTROLLER - `/api/messages`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/messages` | ✅ | Xabarlar ro'yxati |
| GET | `/api/messages/conversations` | ✅ | Suhbatlar ro'yxati |
| GET | `/api/messages/conversation/{otherUserId}` | ✅ | Suhbat xabarlari |
| GET | `/api/messages/{id}` | ✅ | Xabar detali |
| POST | `/api/messages` | ✅ | Xabar yuborish |
| POST | `/api/messages/upload-attachment` | ✅ | Fayl yuklash (multipart) |
| PUT | `/api/messages` | ✅ | Xabar yangilash |
| DELETE | `/api/messages/{id}` | ✅ | Xabar o'chirish |

### 8. NOTIFICATIONS CONTROLLER - `/api/notifications`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/notifications?page=1&pageSize=20` | ✅ | Bildirishnomalar |
| GET | `/api/notifications/{id}` | ✅ | Bildirishnoma detali |
| PUT | `/api/notifications/{id}/read` | ✅ | O'qilgan deb belgilash |
| PUT | `/api/notifications/read-all` | ✅ | Hammasini o'qilgan deb belgilash |
| PUT | `/api/notifications` | ✅ | Yangilash |
| DELETE | `/api/notifications/{id}` | ✅ | O'chirish |

### 9. REVIEWS CONTROLLER - `/api/reviews`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/reviews` | ❌ | Barcha sharhlar |
| GET | `/api/reviews/property/{propertyId}` | ❌ | Mulk sharhlari |
| GET | `/api/reviews/{id}` | ❌ | Sharh detali |
| POST | `/api/reviews` | ✅ | Sharh qoldirish |
| PUT | `/api/reviews` | ✅ | Sharh yangilash |
| DELETE | `/api/reviews/{id}` | ✅ | Sharh o'chirish |

### 10. RENTAL CONTRACTS - `/api/rentalcontracts`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/rentalcontracts` | ✅ | Ijara shartnomalari |
| GET | `/api/rentalcontracts/{id}` | ✅ | Shartnoma detali |
| GET | `/api/rentalcontracts/booking/{bookingId}` | ✅ | Bron shartnomasi |
| POST | `/api/rentalcontracts` | Host/Admin | Shartnoma yaratish |
| PUT | `/api/rentalcontracts/{id}` | Host/Admin | Shartnoma yangilash |
| PUT | `/api/rentalcontracts/{id}/sign` | ✅ | Shartnomani imzolash |
| DELETE | `/api/rentalcontracts/{id}` | Host/Admin | Shartnoma o'chirish |

### 11. ANNOUNCEMENTS - `/api/announcements`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/announcements` | ❌ | E'lonlar ro'yxati |
| GET | `/api/announcements/{id}` | ❌ | E'lon detali |
| POST | `/api/announcements` | Admin | E'lon yaratish |
| PUT | `/api/announcements` | Admin | E'lon yangilash |
| DELETE | `/api/announcements/{id}` | Admin | E'lon o'chirish |

### 12. SAVED SEARCHES - `/api/savedsearches`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/savedsearches` | ✅ | Saqlangan qidiruvlar |
| POST | `/api/savedsearches` | ✅ | Qidiruv saqlash |
| DELETE | `/api/savedsearches/{id}` | ✅ | Qidiruv o'chirish |

### 13. DISCOUNTS - `/api/discounts`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/discounts` | ❌ | Chegirmalar ro'yxati |
| GET | `/api/discounts/active` | ❌ | Faol chegirmalar |
| GET | `/api/discounts/{id}` | ❌ | Chegirma detali |
| POST | `/api/discounts/validate` | ❌ | Kodni tekshirish |
| POST | `/api/discounts` | Host/Admin | Chegirma yaratish |
| PUT | `/api/discounts` | Host/Admin | Chegirma yangilash |
| DELETE | `/api/discounts/{id}` | Host/Admin | Chegirma o'chirish |

### 14. ANALYTICS - `/api/analytics`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/analytics/dashboard` | ❌ | Dashboard statistikasi |
| GET | `/api/analytics/properties` | ❌ | Mulk statistikasi |
| GET | `/api/analytics/users` | ❌ | User statistikasi |
| GET | `/api/analytics/bookings` | Admin | Bron statistikasi |
| GET | `/api/analytics/revenue` | Admin | Daromad statistikasi |

### 15. AI RECOMMENDATIONS - `/api/airecommendations`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/airecommendations` | ✅ | Tavsiyalar ro'yxati |
| GET | `/api/airecommendations/{id}` | ✅ | Tavsiya detali |
| POST | `/api/airecommendations` | ✅ | Tavsiya yaratish |
| POST | `/api/airecommendations/hybrid` | ❌ | Hybrid tavsiyalar |
| PUT | `/api/airecommendations` | ✅ | Tavsiya yangilash |
| DELETE | `/api/airecommendations/{id}` | ✅ | Tavsiya o'chirish |

### 16. PROPERTY IMAGES - `/api/propertyimages`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/propertyimages` | ✅ | Rasmlar ro'yxati |
| GET | `/api/propertyimages/{id}` | ✅ | Rasm detali |
| POST | `/api/propertyimages` | Host/Admin | Rasm yaratish |
| PUT | `/api/propertyimages` | Host/Admin | Rasm yangilash |
| DELETE | `/api/propertyimages/{id}` | Host/Admin | Rasm o'chirish |

### 17. PROPERTY VIEWS - `/api/propertyviews`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/propertyviews` | Host/Admin | Ko'rishlar statistikasi |
| POST | `/api/propertyviews` | ❌ | Ko'rish qo'shish |

### 18. HOME REQUESTS - `/api/homerequests`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/homerequests` | Admin | So'rovlar ro'yxati |
| POST | `/api/homerequests` | ✅ | So'rov yuborish |
| GET | `/api/homerequests/{id}` | Admin | So'rov detali |
| PUT | `/api/homerequests/{id}/status` | Admin | Status yangilash |

### 19. PAYME/CLICK INTEGRATIONS - `/api/payme`, `/api/click`

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| POST | `/api/payme` | ❌ | Payme webhook |
| POST | `/api/click` | ❌ | Click webhook |

---

## 🌐 SignalR Hubs

| Hub | URL | Tavsif |
|-----|-----|--------|
| ChatHub | `/hubs/chat` | Real-time chat |
| NotificationHub | `/hubs/notifications` | Real-time bildirishnomalar |

**Chat Hub Methods:**
- `SendMessage(receiverId, message)` - Xabar yuborish
- `JoinConversation(otherUserId)` - Suhbatga qo'shilish
- `LeaveConversation(otherUserId)` - Suhbatdan chiqish

**Notification Hub Methods:**
- `MarkAsRead(notificationId)` - O'qilgan deb belgilash

---

## 📁 Frontend Structure Tavsiya

```
src/app/
├── core/
│   ├── models/
│   │   ├── auth.model.ts
│   │   ├── user.model.ts
│   │   ├── property.model.ts
│   │   ├── booking.model.ts
│   │   ├── payment.model.ts
│   │   ├── message.model.ts
│   │   ├── notification.model.ts
│   │   └── ...
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── property.service.ts
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   ├── message.service.ts
│   │   ├── notification.service.ts
│   │   ├── favorite.service.ts
│   │   ├── review.service.ts
│   │   └── signalr.service.ts
│   └── interceptors/
│       ├── jwt.interceptor.ts
│       └── error.interceptor.ts
├── features/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── profile/
│   ├── properties/
│   │   ├── property-list/
│   │   ├── property-detail/
│   │   ├── property-create/
│   │   └── property-search/
│   ├── bookings/
│   │   ├── booking-list/
│   │   ├── booking-create/
│   │   └── booking-detail/
│   ├── messages/
│   │   ├── conversation-list/
│   │   └── chat/
│   ├── dashboard/
│   │   ├── user-dashboard/
│   │   ├── host-dashboard/
│   │   └── admin-dashboard/
│   └── admin/
│       ├── user-management/
│       ├── property-management/
│       └── analytics/
└── shared/
    ├── components/
    │   ├── header/
    │   ├── footer/
    │   ├── property-card/
    │   ├── booking-card/
    │   └── notification-badge/
    └── directives/
        └── image-fallback.directive.ts
```

---

## 📦 Kerakli Angular Services (18 ta)

### 1. AuthService
```typescript
login(credentials: LoginRequest): Observable<AuthUserInfo>
register(data: RegisterRequest): Observable<AuthUserInfo>
logout(): Observable<void>
refreshToken(): Observable<AuthUserInfo>
getCurrentUser(): Observable<UserResponse>
updateProfile(data: UserUpdateDto): Observable<UserResponse>
uploadAvatar(file: File): Observable<UserResponse>
forgotPassword(email: string): Observable<void>
resetPassword(data: ResetPasswordRequest): Observable<void>
verifyEmail(token: string): Observable<void>
```

### 2. UserService
```typescript
getAllUsers(pagination: PaginationParams): Observable<PagedResult<UserResponse>>
getUserById(id: string): Observable<UserResponse>
createUser(data: CreateUserRequest): Observable<User>
updateUser(data: UpdateUserRequest): Observable<User>
deleteUser(id: string): Observable<void>
searchUsers(query: string, pagination: PaginationParams): Observable<PagedResult<UserResponse>>
getUserStatistics(): Observable<UserStatistics>
```

### 3. PropertyService
```typescript
getAllProperties(query: PropertyQueryParams): Observable<PagedResult<PropertyResponse>>
getPropertyById(id: string): Observable<PropertyResponse>
createProperty(data: PropertyCreateDto): Observable<PropertyResponse>
updateProperty(id: string, data: Property): Observable<Property>
deleteProperty(id: string): Observable<void>
searchProperties(params: PropertySearchParams): Observable<PagedResult<PropertyResponse>>
getFeaturedProperties(count: number): Observable<PropertyResponse[]>
getSimilarProperties(id: string, count: number): Observable<PropertyResponse[]>
getLocationSuggestions(query: string): Observable<string[]>
```

### 4. FavoriteService
```typescript
getFavorites(pagination: PaginationParams): Observable<PagedResult<Favorite>>
addFavorite(propertyId: string): Observable<Favorite>
removeFavorite(id: string): Observable<void>
// isFavorite - GET /api/favorites dan olingan ro'yxat orqali tekshiriladi
```

### 5. BookingService
```typescript
getAllBookings(query: BookingQueryParams): Observable<PagedResult<BookingResponse>>
getMyBookings(query: BookingQueryParams): Observable<PagedResult<BookingResponse>>
getHostBookings(query: BookingQueryParams): Observable<PagedResult<BookingResponse>>
getBookingById(id: string): Observable<BookingResponse>
createBooking(data: BookingCreateDto): Observable<BookingResponse>
confirmBooking(id: string): Observable<BookingResponse>
cancelBooking(id: string): Observable<BookingResponse>
updateBooking(data: Booking): Observable<Booking>
deleteBooking(id: string): Observable<void>
getPropertyAvailability(propertyId: string, year: number, month: number): Observable<AvailabilityCalendar>
createHold(request: BookingHoldRequest): Observable<void>
releaseHold(holdId: string): Observable<void>
```

### 6. PaymentService
```typescript
getAllPayments(pagination: PaginationParams): Observable<PagedResult<Payment>>
getMyPayments(pagination: PaginationParams): Observable<PagedResult<Payment>>
getPaymentById(id: string): Observable<Payment>
getPaymentByBookingId(bookingId: string): Observable<Payment>
getPaymentSummary(): Observable<PaymentSummary>
createPayment(data: Payment): Observable<Payment>
// initiatePayment va verifyPayment - Payme/Click webhook orqali
updatePayment(data: Payment): Observable<Payment>
cancelPayment(id: string): Observable<Payment>
```

### 7. MessageService
```typescript
getAllMessages(pagination: PaginationParams): Observable<PagedResult<Message>>
getConversations(): Observable<Conversation[]>
getConversationMessages(otherUserId: string): Observable<Message[]>
getMessageById(id: string): Observable<Message>
sendMessage(data: Message): Observable<Message>
updateMessage(data: Message): Observable<Message>
deleteMessage(id: string): Observable<void>
uploadAttachment(file: File): Observable<AttachmentResponse>
```

### 8. NotificationService
```typescript
getAllNotifications(pagination: PaginationParams): Observable<PagedResult<Notification>>
getNotificationById(id: string): Observable<Notification>
markAsRead(id: string): Observable<void>
markAllAsRead(): Observable<void>
updateNotification(data: Notification): Observable<Notification>
deleteNotification(id: string): Observable<void>
```

### 9. ReviewService
```typescript
getAllReviews(): Observable<Review[]>
getPropertyReviews(propertyId: string): Observable<Review[]>
getReviewById(id: string): Observable<Review>
createReview(data: Review): Observable<Review>
updateReview(data: Review): Observable<Review>
deleteReview(id: string): Observable<void>
```

### 10. DiscountService
```typescript
getAllDiscounts(pagination: PaginationParams): Observable<PagedResult<Discount>>
getActiveDiscounts(): Observable<Discount[]>
getDiscountById(id: string): Observable<Discount>
validateDiscountCode(code: string): Observable<DiscountValidateResponse>
createDiscount(data: Discount): Observable<Discount>
updateDiscount(data: Discount): Observable<Discount>
deleteDiscount(id: string): Observable<void>
```

### 11. AnalyticsService
```typescript
getDashboardStats(): Observable<DashboardStats>
getPropertyStats(): Observable<PropertyStats>
getUserStats(): Observable<UserStats>
getBookingStats(): Observable<BookingStats>
getRevenueStats(): Observable<RevenueStats>
```

### 12. AnnouncementService
```typescript
getAllAnnouncements(pagination: PaginationParams): Observable<PagedResult<Announcement>>
getAnnouncementById(id: string): Observable<Announcement>
createAnnouncement(data: Announcement): Observable<Announcement>
updateAnnouncement(data: Announcement): Observable<Announcement>
deleteAnnouncement(id: string): Observable<void>
```

### 13. SavedSearchService
```typescript
getAllSavedSearches(): Observable<SavedSearch[]>
createSavedSearch(data: SavedSearch): Observable<SavedSearch>
deleteSavedSearch(id: string): Observable<void>
```

### 14. PropertyImageService
```typescript
getAllImages(pagination: PaginationParams): Observable<PagedResult<PropertyImage>>
getImageById(id: string): Observable<PropertyImage>
createImage(data: PropertyImage): Observable<PropertyImage>
updateImage(data: PropertyImage): Observable<PropertyImage>
deleteImage(id: string): Observable<void>
```

### 15. PropertyViewService
```typescript
getViewStats(): Observable<PropertyViewStats>
recordView(propertyId: string): Observable<void>
```

### 16. RentalContractService
```typescript
getAllContracts(): Observable<RentalContract[]>
getContractById(id: string): Observable<RentalContract>
getContractByBookingId(bookingId: string): Observable<RentalContract>
createContract(data: RentalContract): Observable<RentalContract>
updateContract(id: string, data: RentalContract): Observable<RentalContract>
signContract(id: string): Observable<RentalContract>
deleteContract(id: string): Observable<void>
```

### 17. HomeRequestService
```typescript
getAllRequests(): Observable<HomeRequest[]>
getRequestById(id: string): Observable<HomeRequest>
createRequest(data: HomeRequest): Observable<HomeRequest>
updateRequestStatus(id: string, status: string): Observable<HomeRequest>
```

### 18. AiRecommendationService
```typescript
getAllRecommendations(pagination: PaginationParams): Observable<PagedResult<AiRecommendation>>
getRecommendationById(id: string): Observable<AiRecommendation>
createRecommendation(data: AiRecommendation): Observable<AiRecommendation>
getHybridRecommendations(request: HybridRecommendationRequest): Observable<HybridRecommendationResponse[]>
updateRecommendation(data: AiRecommendation): Observable<AiRecommendation>
deleteRecommendation(id: string): Observable<void>
```

---

## 📋 Kerakli Models/Interfaces (Asosiy 15 ta)

```typescript
// Pagination
interface PaginationParams {
  page: number;
  pageSize: number;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Auth
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthUserInfo {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// User
interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'Guest' | 'Host' | 'Admin';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
}

// Property
interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyType: string;
  amenities: string[];
  images: PropertyImage[];
  hostId: string;
  host: UserResponse;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface PropertyCreateDto {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyType: string;
  amenities: string[];
  images?: File[];
}

interface PropertyQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PropertySearchParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  amenities?: string[];
  availableFrom?: string;
  availableTo?: string;
  page?: number;
  pageSize?: number;
}

// Booking
interface BookingResponse {
  id: string;
  propertyId: string;
  property: PropertyResponse;
  guestId: string;
  guest: UserResponse;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  guestCount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingCreateDto {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  specialRequests?: string;
  discountCode?: string;
}

interface BookingQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

interface BookingHoldRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
}

// Payment
interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  method: 'Payme' | 'Click' | 'Card';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

interface PaymentInitiateRequest {
  bookingId: string;
  method: string;
}

interface PaymentInitiateResponse {
  paymentUrl: string;
  paymentId: string;
}

// Message
interface Message {
  id: string;
  senderId: string;
  sender?: UserResponse;
  receiverId: string;
  receiver?: UserResponse;
  content: string;
  attachments?: Attachment[];
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Conversation {
  otherUser: UserResponse;
  lastMessage: Message;
  unreadCount: number;
}

// Notification
interface Notification {
  id: string;
  userId: string;
  type: 'Booking' | 'Payment' | 'Message' | 'Review' | 'System';
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Review
interface Review {
  id: string;
  propertyId: string;
  authorId: string;
  author: UserResponse;
  rating: number;
  comment: string;
  createdAt: string;
}

// Discount
interface Discount {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

interface DiscountValidateRequest {
  code: string;
  bookingAmount: number;
}

interface DiscountValidateResponse {
  isValid: boolean;
  discount?: Discount;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

// Favorite
interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property: PropertyResponse;
  createdAt: string;
}
```

---

## 🎨 Kerakli Components (Asosiy)

### Public Pages (Auth shart emas)
1. **HomeComponent** - Bosh sahifa
2. **PropertyListComponent** - Mulk ro'yxati
3. **PropertyDetailComponent** - Mulk detali
4. **PropertySearchComponent** - Qidiruv
5. **LoginComponent** - Kirish
6. **RegisterComponent** - Ro'yxatdan o'tish
7. **ForgotPasswordComponent** - Parolni tiklash
8. **ResetPasswordComponent** - Yangi parol
9. **AboutComponent** - Biz haqimizda
10. **ContactComponent** - Aloqa

### Protected Pages (Auth kerak)
1. **ProfileComponent** - Profil
2. **MyBookingsComponent** - Mening bronlarim
3. **FavoritesComponent** - Sevimlilar
4. **MessagesComponent** - Xabarlar
5. **NotificationsComponent** - Bildirishnomalar
6. **PaymentHistoryComponent** - To'lovlar tarixi

### Host Pages (Host/Admin roli)
1. **HostDashboardComponent** - Host dashboard
2. **MyPropertiesComponent** - Mening mulklarim
3. **PropertyCreateComponent** - Mulk yaratish
4. **PropertyEditComponent** - Mulk tahrirlash
5. **HostBookingsComponent** - Host bronlari
6. **RentalContractsComponent** - Ijara shartnomalari

### Admin Pages (Admin roli)
1. **AdminDashboardComponent** - Admin dashboard
2. **UserManagementComponent** - User boshqaruvi
3. **PropertyManagementComponent** - Mulk boshqaruvi
4. **BookingManagementComponent** - Bron boshqaruvi
5. **PaymentManagementComponent** - To'lov boshqaruvi
6. **AnnouncementManagementComponent** - E'lon boshqaruvi
7. **AnalyticsComponent** - Statistika
8. **HomeRequestsComponent** - So'rovlar boshqaruvi

---

## 🛡️ Interceptors

### JWT Interceptor
```typescript
// Har so'rovga Authorization header qo'shish
// Token muddati tugasa, refresh qilish
```

### Error Interceptor
```typescript
// 401 - Login sahifasiga yo'naltirish
// 403 - Ruxsat yo'q xabar
// 404 - Topilmadi xabar
// 500 - Server xatosi
// Network errors - Internet aloqasi tekshirish
```

---

## 📱 Responsive Breakpoints

```scss
// TailCSS breakpoints
sm: 640px   // Telefon (portrait)
md: 768px   // Planshet
lg: 1024px  // Kichik noutbuk
xl: 1280px  // Noutbuk
2xl: 1536px // Katta monitor
```

---

## 🔐 Auth Guards

```typescript
// AuthGuard - Faqat auth foydalanuvchilar uchun
// GuestGuard - Faqat auth bo'lmagan foydalanuvchilar uchun
// HostGuard - Faqat Host/Admin rollari uchun
// AdminGuard - Faqat Admin roli uchun
```

---

## 🌍 i18n (Tarjimalar)

**Qo'llab-quvvatlanadigan tillar:**
- `uz` - O'zbek (default)
- `ru` - Ruscha
- `en` - Inglizcha

**Tarjima fayllari:** `src/assets/i18n/{lang}.json`

---

## 📊 State Management (RxJS)

**Subject'lar:**
- `currentUser$` - Joriy foydalanuvchi
- `isAuthenticated$` - Auth status
- `unreadNotifications$` - O'qilmagan bildirishnomalar
- `favoritesCount$` - Sevimlilar soni

---

## ✅ Checklist

### Phase 1: Core (Hafta 1-2)
- [ ] Auth pages (login, register, forgot-password)
- [ ] AuthService + JWT interceptor
- [ ] Header component
- [ ] Footer component
- [ ] Home page (featured properties)
- [ ] Property list page
- [ ] Property detail page

### Phase 2: User Features (Hafta 3-4)
- [ ] Profile page
- [ ] Favorites page
- [ ] My bookings page
- [ ] Booking create flow
- [ ] Payment integration (Payme/Click)
- [ ] Booking calendar

### Phase 3: Host Features (Hafta 5-6)
- [ ] Host dashboard
- [ ] Property management (CRUD)
- [ ] Host bookings management
- [ ] Property images upload
- [ ] Rental contracts

### Phase 4: Advanced (Hafta 7-8)
- [ ] Messages (SignalR)
- [ ] Notifications (SignalR)
- [ ] Reviews
- [ ] Search filters
- [ ] Admin dashboard
- [ ] Analytics

---

## 📞 Qo'llab-quvvatlash

Backend documentation: `http://localhost:5000/swagger`

**Keyingi qadam:**
1. Angular 20 loyihasini yaratish
2. Core services ni yozish
3. Auth pages ni yaratish
4. Property list/detail pages ni yaratish
