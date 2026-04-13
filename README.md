# Mulkchi

Mulkchi — O‘zbekiston ko‘chmas mulk platformasi uchun full-stack loyiha (ASP.NET Core Web API + Angular).

## Asosiy texnologiyalar

- **Backend:** .NET 9, ASP.NET Core, EF Core (SQL Server), SignalR, ML.NET
- **Frontend:** Angular 20, Angular Material, RxJS
- **Xavfsizlik:** JWT bearer auth, cookie-based session oqimi, rate limiting, CORS
- **Infratuzilma:** Docker, docker-compose

## Loyiha tuzilmasi

- `/Mulkchi.Api` — Web API
- `/Mulkchi.Frontend` — Angular ilova
- `/Mulkchi.Api.Tests.Unit` — backend unit testlar
- `/Mulkchi.Tests` — qo‘shimcha test loyihasi
- `/docker-compose.yml` — lokal konteyner muhiti
- `/env.example` — `.env` uchun namunaviy qiymatlar

## Muhim funksiyalar

- JWT asosidagi autentifikatsiya va avtorizatsiya
- Ko‘chmas mulk e’lonlari va qidiruv endpointlari
- Bron, to‘lov, sharh, favorite, saved search kabi biznes modullar
- SignalR orqali real-time chat va notification
- ML.NET asosida narx tavsiyasi/prediction
- Health check endpointlar (`/health`, `/health/database`, `/health/file-storage`)

## Lokal ishga tushirish

### 1) Talablar

- .NET SDK 9
- Node.js 20+ (Angular frontend uchun)
- SQL Server (lokal yoki konteyner)

### 2) Backend sozlash va ishga tushirish

```bash
cd Mulkchi
dotnet restore Mulkchi.sln
```

`JwtSettings:Secret` bo‘sh bo‘lsa API ishga tushmaydi. Secret ni user-secrets yoki env orqali bering:

```bash
cd Mulkchi/Mulkchi.Api
dotnet user-secrets init
dotnet user-secrets set "JwtSettings:Secret" "kamida-32-belgili-kuchli-maxfiy-kalit"
```

Kerak bo‘lsa DB connection string ni ham sozlang (`ConnectionStrings:DefaultConnection`).

API ni ishga tushirish:

```bash
cd Mulkchi
dotnet run --project Mulkchi.Api
```

Backend URL (development): `http://localhost:5009`  
Swagger: `http://localhost:5009/swagger`

### 3) Frontend ishga tushirish

```bash
cd Mulkchi/Mulkchi.Frontend
npm ci
npm start
```

Frontend URL: `http://localhost:4200`  
Development rejimida `/api` va `/hubs` so‘rovlari `proxy.conf.js` orqali backend ga proxylanadi.

## Docker orqali ishga tushirish

```bash
cd Mulkchi
cp env.example .env
docker compose up --build
```

Asosiy servislar: `db`, `redis`, `backend`, `frontend`.

Email verification uchun `.env` ichida SMTP qiymatlarni ham to'ldiring:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SENDER_EMAIL=youremail@gmail.com
SMTP_SENDER_PASSWORD=your-app-password
SMTP_SENDER_NAME=Mulkchi Platform
```

Gmail ishlatilsa oddiy parol emas, `App Password` qo'llang.

## Konfiguratsiya (qisqa)

- `Mulkchi.Api/appsettings.json` — development default sozlamalar
- `Mulkchi.Api/appsettings.Production.json` — production sozlamalar
- `AllowedOrigins` — production CORS originlari
- `RateLimiting`:
  - Development: `Enabled=false`
  - Production: `Enabled=true`, `General=300`, `Auth=20`, `Upload=30`, `WindowSeconds=60`

## Test va build

Backend:

```bash
cd Mulkchi
dotnet build Mulkchi.sln -c Release
dotnet test Mulkchi.sln -c Release
```

Frontend:

```bash
cd Mulkchi/Mulkchi.Frontend
npm run build
npm run test:ci
```

Eslatma: ushbu repoda `npm run lint` uchun Angular lint target hozircha sozlanmagan.

## Tavsiya tizimi va geolokatsiya (Hybrid)

Loyihada mulk tavsiyasi uchun gibrid yondashuv ishlatiladi. Backend endpoint:

- `POST /api/AiRecommendations/hybrid`

Request (asosiy maydonlar):

- `userId` (ixtiyoriy)
- `latitude`, `longitude` (ixtiyoriy, geolokatsiya)
- `radiusKm` (default: `10`)
- `limit` (default: `10`, max: `50`)

### Scoring formulasi

Hybrid score qat'iy ushbu vaznlarda hisoblanadi:

- masofa mosligi: **35%**
- narx diapazoni mosligi: **25%**
- xona soni mosligi: **20%**
- mulk turi mosligi: **15%**
- foydalanuvchi xususiyatlari mosligi: **5%**

Masofa hisobida Haversine formulasi qo‘llanadi (`PropertyGeoExtensions.DistanceKm`).

### A/B variant

Hybrid response har bir recommendation uchun `abVariant` (`A` yoki `B`) qaytaradi.
Variant deterministik ravishda `propertyId` va `userId` kombinatsiyasidan hosil qilinadi.

### Dashboard analytics

`GET /api/analytics/dashboard` ichidagi `recommendations` blokida quyidagilar real hisoblanadi:

- `totalRecommendations`
- `viewedRecommendations`
- `clickedRecommendations`
- `clickThroughRate`
- `conversionRate`
- `topRecommendationTypes`
- `recommendationPerformance`
- `abTestPerformance` (`variantA`, `variantB` count va CTR)

## Litsenziya

MIT — batafsil: [LICENSE](LICENSE)

---

## Amalga oshirilgan vs Rejalashtirilgan funksiyalar

Quyidagi jadval muammo bayonotidagi talablar bilan joriy holat o'rtasidagi moslikni ko'rsatadi.

| #   | Funksiya                                                                            | Holat                   | Izoh                                                                                        |
| --- | ----------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **5 bosqichli mulk e'loni formasi** (Basic → Parametrlar → Narx → Manzil → Rasmlar) | ✅ Amalga oshirildi     | `property-form` component qayta yozildi                                                     |
| 2   | **Rasm WebP konvertatsiya** (thumbnail 300×200, medium 800×600, full)               | ✅ Amalga oshirildi     | `SixLabors.ImageSharp 3.1.12` orqali; `LocalFileStorageBroker` yangilandi                   |
| 3   | **Maksimal 20 ta rasm** per property                                                | ✅ Amalga oshirildi     | `PropertyImagesUploadController` + frontend default                                         |
| 4   | **Backend qidiruv (search/autocomplete)**                                           | ✅ Mavjud               | `/api/Properties/search`, `/api/Properties/autocomplete`                                    |
| 5   | **Live search (debounce 300ms)**                                                    | ✅ Yaxshilandi          | `GlobalSearchComponent` haqiqiy query bilan backend-ga yuboriladi                           |
| 6   | **ElasticSearch integratsiyasi**                                                    | ⏳ Rejalashtirilgan     | Hozir SQL Server full-text search; ES standalone qatlam sifatida qo'shilishi mumkin         |
| 7   | **Phantom booking himoyasi** (10-daqiqalik pessimistik lock)                        | ✅ Amalga oshirildi     | `BookingHold` entity + `POST /api/Bookings/hold`, `DELETE /api/Bookings/hold/{id}`          |
| 8   | **Availability calendar** (band sanalar)                                            | ✅ Mavjud               | `GET /api/Bookings/availability/{propertyId}?year=&month=`                                  |
| 9   | **Payme / Click to'lov integratsiyasi**                                             | ✅ Mavjud               | `PaymentsController` mavjud                                                                 |
| 10  | **To'lovdan keyin email+SMS notification**                                          | ✅ Mavjud               | `MailKit` + SMS stub; Payme/Click webhook uchun kengaytirish mumkin                         |
| 11  | **Ijara shartnomasi PDF + e-imzo**                                                  | ⏳ Qisman               | `RentalContracts` moduli bor; PDF generation va e-imzo integratsiyasi rejalashtirilgan      |
| 12  | **KYC (ijarachilar tekshiruvi)**                                                    | ⏳ Rejalashtirilgan     | —                                                                                           |
| 13  | **Onlayn muzokara (bid/offer)**                                                     | ⏳ Rejalashtirilgan     | —                                                                                           |
| 14  | **Geolokatsiyaga asoslangan tavsiya tizimi**                                        | ✅ Amalga oshirildi     | `ML.NET` + `AiRecommendations` moduli, `/api/Recommendations`                               |
| 15  | **Analytics: public (barcha uchun)**                                                | ✅ Mavjud + yaxshilandi | `GET /api/Analytics/market-overview`, `/by-region`, `/price-trends` — 1 soat response cache |
| 16  | **Analytics: admin dashboard**                                                      | ✅ Mavjud               | `AnalyticsDashboardComponent` (Admin rol talab qilinadi)                                    |
| 17  | **Materialized view / cron refresh**                                                | ⏳ Qisman               | `ResponseCaching` (1 soat) qo'shildi; DB materialized view va background cron keyinchalik   |
| 18  | **Redis kesh**                                                                      | ⏳ Rejalashtirilgan     | Hozir `IMemoryCache` (in-process); `IDistributedCache` + Redis kengaytirish uchun tayyor    |
| 19  | **HSTS (HTTP Strict Transport Security)**                                           | ✅ Amalga oshirildi     | `SecurityHeadersMiddleware` yangilandi                                                      |
| 20  | **CSP, XSS, CSRF himoyasi**                                                         | ✅ Amalga oshirildi     | `SecurityHeadersMiddleware`, `SameSite` cookie, `DomSanitizer`                              |
| 21  | **Rate Limiting**                                                                   | ✅ Amalga oshirildi     | Sliding window per-IP; `Auth:20`, `Upload:30`, `General:300` req/min                        |
| 22  | **SQL Injection himoyasi (Prisma/Parameterized)**                                   | ✅ Amalga oshirildi     | EF Core parametrli so'rovlar                                                                |
| 23  | **Parol bcrypt (salt=12)**                                                          | ✅ Amalga oshirildi     | `BCrypt.Net-Next`                                                                           |
| 24  | **JWT autentifikatsiya**                                                            | ✅ Amalga oshirildi     | httpOnly cookie + BehaviorSubject refresh loop himoyasi                                     |
| 25  | **SignalR real-time chat + notification**                                           | ✅ Amalga oshirildi     | `ChatHub`, `NotificationHub`                                                                |
| 26  | **Ko'p tillik qo'llab-quvvatlash**                                                  | ✅ Amalga oshirildi     | `uz`, `ru`, `en` (Accept-Language header)                                                   |
