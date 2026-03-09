# Mulkchi Frontend

Mulkchi - O'zbekiston ko'chmas mulk platformasi uchun Angular 19 frontend ilovasi.

## Xususiyatlari

- 🔐 **JWT autentifikatsiya** - Token bilan kirish va ro'yxatdan o'tish
- 🏠 **Mulk qidirish** - Filtrlar bilan mulklarni qidirish
- 🤖 **AI narx bashorati** - ML.NET orqali narxni bashorat qilish
- 💬 **Real-time chat** - SignalR bilan jonli muloqot
- 📱 **Responsive dizayn** - Mobil va desktop qurilmalar uchun
- 🎨 **Angular Material** - Zamonaviy UI komponentlari
- 🌍 **O'zbek tilida** - To'liq o'zbek tilida interfeys

## Texnologiyalar

- **Angular 19** - Standalone components
- **Angular Material** - UI component library
- **SignalR** - Real-time communication
- **SCSS** - Styling
- **TypeScript** - Type safety

## Rivojlantirish serveri

Lokal serverni ishga tushirish uchun:

```bash
cd Mulkchi.Frontend
npm install
ng serve
```

Server ishga tushgandan so'ng, brauzerningizda `http://localhost:4200/` manzilini oching.

## Backend API

Backend server: `http://localhost:5009`

- **Autentifikatsiya**: `/api/auth/*`
- **Mulkklar**: `/api/properties/*`
- **AI bashorat**: `/api/analytics/predict-price`
- **SignalR hublar**: `/hubs/chat`, `/hubs/notifications`

## Struktura

```
src/app/
├── core/
│   ├── interfaces/     # TypeScript interfeyslari
│   ├── services/       # API xizmatlari
│   ├── guards/         # Route guardlar
│   └── interceptors/   # HTTP interceptorlar
├── pages/
│   ├── home/           # Asosiy sahifa
│   ├── auth/           # Kirish/ro'yxatdan o'tish
│   ├── ai-predictor/   # AI bashorat
│   └── ...             # Boshqa sahifalar
└── app.ts              # Asosiy komponent
```

## Build

Ishlab chiqarish uchun build qilish:

```bash
ng build
```

Build fayllari `dist/` papkasida saqlanadi.

## Testlar

Unit testlarni ishga tushirish:

```bash
ng test
```

## Muhim eslatmalar

- Backend server ishga tushirilgan bo'lishi kerak (`http://localhost:5009`)
- Angular Material v2 bilan moslashgan
- Standalone components arxitekturasidan foydalanilgan
