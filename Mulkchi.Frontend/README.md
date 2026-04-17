# Mulkchi Frontend 🏠

![Angular](https://img.shields.io/badge/Angular-20-red?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![RxJS](https://img.shields.io/badge/RxJS-7.0-purple?style=for-the-badge)
![Signals](https://img.shields.io/badge/Signals-✓-green?style=for-the-badge)

**Mulkchi** - O'zbekiston ko'chmas mulk platformasi uchun zamonaviy Angular 20 frontend ilovasi.

## 🚀 Asosiy Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| 🔐 **JWT Auth** | Token-based autentifikatsiya va avtorizatsiya |
| ⚡ **Angular Signals** | Reactive state management with computed values |
| 📱 **Responsive** | Mobil, tablet va desktop qurilmalar uchun |
| 💬 **Real-time** | SignalR orqali jonli chat va bildirishnomalar |
| 🤖 **AI Tavsiyalar** | Mashinaviy o'rganish asosida mulk tavsiyalari |
| 📊 **Dashboard** | Host va Admin uchun statistik dashboardlar |
| 💰 **To'lovlar** | Payme/Click integratsiyasi |
| 🌍 **O'zbek tili** | To'liq lokalizatsiya (UZ, RU, EN) |

## 📊 Loyiha Statistikasi

```
📁 Jami Fayllar
├── 🎨 Komponentlar    ~62 ta
├── 🔧 Servislar       ~28 ta  
├── 📋 Modellar        ~25 ta
├── 🛡️ Interceptorlar  ~3 ta
├── 🎯 Guardlar        ~3 ta
├── 🌐 i18n Fayllar    ~3 ta
└── 📄 Routes          ~40 ta

🎯 API Endpointlar qamrovi: 124 ta
├── Auth              14 ta
├── Users             10 ta
├── Properties        10 ta
├── Bookings          12 ta ✅
├── Payments          9 ta  ✅
├── Favorites         3 ta
├── Messages          8 ta
├── Notifications     6 ta
├── Reviews           6 ta
├── RentalContracts   7 ta
├── Announcements     4 ta
├── SavedSearches     3 ta
├── Discounts         7 ta
├── Analytics         5 ta  ✅
├── AIRecommendations 6 ta
├── PropertyImages    5 ta
└── Admin             11 ta ✅
```

## 🛠️ Texnologiyalar

### Core
- **Angular 20** - Standalone components, Signals, `input()`/`output()`
- **TypeScript 5.4** - Type safety, strict mode
- **RxJS 7** - Observable streams, `toSignal()` interop
- **Angular Material 18** - Material Design components

### State Management
- **Angular Signals** - `signal()`, `computed()`, `effect()`
- **RxJS Interop** - `toSignal()`, `toObservable()`
- **Agent Pattern** - Signal-based service architecture

### Real-time
- **SignalR** - WebSocket connections
- **ChatAgent** - Real-time messaging with typing indicators
- **NotificationAgent** - Live notifications with badge updates

### Integrations
- **Payme/Click** - Payment provider integration
- **Google Maps** - Location services
- **ngx-charts** - Analytics visualizations

## 📁 Loyiha Strukturasi

```
src/app/
├── core/
│   ├── models/                    # TypeScript interfaces
│   │   ├── auth.model.ts
│   │   ├── property.model.ts
│   │   ├── booking.model.ts
│   │   └── ... (25 ta model)
│   │
│   ├── services/                  # Agent Services (Signal-based)
│   │   ├── auth.service.ts        # JWT auth
│   │   ├── property-agent.service.ts    # Property state + API
│   │   ├── booking-agent.service.ts     # Booking state + API
│   │   ├── payment-agent.service.ts     # Payment state + Payme/Click
│   │   ├── chat-agent.service.ts        # SignalR chat
│   │   ├── notification-agent.service.ts # SignalR notifications
│   │   ├── analytics-agent.service.ts   # Charts data
│   │   ├── admin-agent.service.ts       # Admin CRUD
│   │   └── ... (28 ta service)
│   │
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts      # Token injection
│   │   ├── success-toast.interceptor.ts  # Success notifications
│   │   └── error-toast.interceptor.ts    # Error handling
│   │
│   └── guards/
│       ├── auth.guard.ts
│       ├── host.guard.ts
│       └── admin.guard.ts
│
├── features/                      # Feature modules
│   ├── home/
│   ├── auth/
│   ├── properties/
│   ├── bookings/
│   ├── payments/
│   ├── chat/
│   ├── dashboard/
│   └── admin/
│
├── shared/                        # Shared components
│   ├── components/
│   │   ├── navbar/
│   │   ├── footer/
│   │   ├── empty-state/          # Empty state UI
│   │   ├── progress-bar/           # Loading indicator
│   │   └── property-card/
│   └── directives/
│
└── app.component.ts              # Root component
```

## 🚀 Ishga Tushirish

### Talablar
- Node.js 20+
- npm 10+
- Backend server (`http://localhost:5009`)

### O'rnatish

```bash
# 1. Loyihani klonlash
git clone <repository-url>
cd Mulkchi/Mulkchi.Frontend

# 2. Dependencyni o'rnatish
npm ci

# 3. Development server
npm start
```

Brauzerda `http://localhost:4200/` ochiladi.

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration production

# Stats
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## 🧪 Testlar

```bash
# Unit testlar
ng test

# Headless testlar (CI)
npm run test:ci

# E2E testlar
ng e2e

# Lint
ng lint
```

## 🎯 Arxitektura Xususiyatlari

### 1. Signal-based State Management
```typescript
// Property Agent - Signal-based service
export class PropertyAgent {
  // State signals
  readonly properties = signal<Property[]>([]);
  readonly loading = signal<boolean>(false);
  
  // Computed values
  readonly totalCount = computed(() => this.properties().length);
  readonly featuredProperties = computed(() => 
    this.properties().filter(p => p.isFeatured)
  );
}
```

### 2. API Integration Pattern
```typescript
// Service method with signal update
getMyBookings(): Observable<Booking[]> {
  this._loading.set(true);
  return this.http.get<Booking[]>('/api/bookings/my').pipe(
    tap(bookings => {
      this._myBookings.set(bookings);  // Signal update
      this._loading.set(false);
    }),
    catchError(err => {
      this._error.set(err.message);
      return throwError(() => err);
    })
  );
}
```

### 3. Real-time with SignalR
```typescript
// Chat Agent - SignalR integration
this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
  this._messages.update(messages => [...messages, message]);
  this.updateConversationFromMessage(message);
});
```

### 4. UI Feedback
- **Progress Bar** - Route navigation indicator
- **Toaster Notifications** - Success/Error messages
- **Empty States** - Friendly empty state illustrations
- **Loading Skeletons** - Content loading placeholders

## 🔐 Xavfsizlik

- JWT Bearer token authentication
- Automatic token refresh
- Role-based access control (Guest, Host, Admin)
- HTTP interceptors for error handling
- Rate limiting support

## 🌐 Backend Integration

| Endpoint | Tavsif |
|----------|--------|
| `http://localhost:5009` | Backend API |
| `/api/auth/*` | Authentication |
| `/api/properties/*` | Properties CRUD |
| `/api/bookings/*` | Bookings management |
| `/api/payments/*` | Payments + Payme/Click |
| `/api/analytics/*` | Statistics |
| `/hubs/chat` | SignalR Chat |
| `/hubs/notifications` | SignalR Notifications |

## 📱 UI Komponentlari

### Material Components
- `MatButton`, `MatIcon`, `MatCard`
- `MatFormField`, `MatInput`, `MatSelect`
- `MatDatepicker`, `MatDialog`
- `MatTable`, `MatPaginator`, `MatSort`
- `MatSnackBar` - Toast notifications
- `MatProgressBar` - Loading indicators

### Custom Components
- `EmptyState` - Empty state illustrations
- `PropertyCard` - Property listing card
- `ChatWindow` - Real-time chat UI
- `NotificationBell` - Notification badge
- `ProgressBar` - Global loading indicator

## 📜 Litsenziya

MIT License

---

**Mulkchi Team** 🏡
*O'zbekiston ko'chmas mulk platformasi*
