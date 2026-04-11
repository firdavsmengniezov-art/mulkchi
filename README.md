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

## Litsenziya

MIT — batafsil: [LICENSE](LICENSE)
