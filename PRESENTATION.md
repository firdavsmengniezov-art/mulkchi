# Mulkchi - Bitiruv Malakaviy Ish Himoyasi

## 1. Loyiha Maqsadi

Mulkchi - O'zbekiston bozoriga moslashgan ko'chmas mulk platformasi.

Asosiy muammo:

- E'lonlar tarqoq platformalarda joylashgan.
- Band qilish, to'lov va aloqa jarayonlari markazlashmagan.
- Mahalliy hududlar bo'yicha aniq analitika va tavsiya tizimi kam.

Yechim:

- Property listing + qidiruv + bron + to'lov + chat + notification bitta tizimda.
- Backend va frontend qatlamlari ajratilgan, API-first yondashuv.
- Demo uchun O'zbekiston bo'yicha realistik test data bilan to'ldirilgan.

## 2. Arxitektura

Arxitektura: Angular Frontend + ASP.NET Core Web API + EF Core + SQL Database.

Qatlamlar:

- `Mulkchi.Frontend`:
  - Angular standalone komponentlar
  - Core services (`auth`, `property`, `booking`, `payment`, `notification`)
  - JWT interceptor + cookie asosidagi refresh flow
- `Mulkchi.Api`:
  - Controllerlar (`Properties`, `Bookings`, `Payments`, `Messages`, `Notifications`, ...)
  - Foundation services (business logic)
  - Storage broker (EF Core)
  - SignalR Hub (`ChatHub`, `NotificationHub`)
- Ma'lumotlar bazasi:
  - Entitylar: `User`, `Property`, `Booking`, `Review`, `Discount`, `Payment`, ...

## 3. Texnologiyalar

- Frontend: Angular, TypeScript, RxJS
- Backend: ASP.NET Core 9, C#
- ORM: Entity Framework Core
- Realtime: SignalR
- Auth: JWT + refresh token (cookie + Authorization Bearer)
- Build/DevOps: Docker, docker-compose

## 4. Amaliy Funksiyalar

- Autentifikatsiya: register/login/logout/refresh
- E'lonlar: listing, filter, detail, o'xshash obyektlar
- Booking: yaratish, tasdiqlash, bekor qilish, availability
- To'lovlar: payment yaratish, status ko'rish, cancellation
- Sharhlar: review qo'shish/o'qish/o'chirish
- Notification: realtime bildirishnomalar
- Chat: SignalR orqali user-to-user xabarlar

## 5. Hozirgi Holat (Taqdimot uchun)

Bu iteratsiyada bajarilgan ishlar:

- Build xatolari bartaraf qilindi.
- Frontend TypeScript config migration muammolari to'g'rilandi (`rootDir`).
- Nullable warninglar tozalandi (AI narx tavsiyasi va geo extension).
- Endpoint mismatchlar muhim joylarda moslashtirildi:
  - Booking create flow URL
  - Review update contract (`PUT /api/Reviews`)
  - HomeRequests/DiscountUsages route naming
  - AiRecommendations route naming
  - Property detail view tracking route
- Development seeder kengaytirildi (idempotent top-up):
  - 10 ta user
  - 20 ta property
  - 15 ta booking
  - 10 ta review
  - 5 ta discount

## 6. Demo Ma'lumotlari

Seed qilingan akkauntlar uchun default parol:

- `Demo12345!`

Eslatma:

- Seeder faqat Development environmentda ishlaydi.
- Mavjud ma'lumot bo'lsa, yetishmayotgan qismini to'ldiradi (top-up).

## 7. Demo Ssenariy (Live)

1. Login qiling (demo user bilan).
2. Property listdan bitta e'lonni oching.
3. Property detailda:
   - review summary
   - blocked dates
   - similar properties
     ni ko'rsating.
4. Booking yarating.
5. Payment yarating va payment list/detailni tekshiring.
6. Notification panelni ochib realtime eventlarni ko'rsating.
7. Chat oynasida xabar yuborishni ko'rsating.

## 8. Himoyada Gapirish Rejasi

1. Muammo va motivatsiya (1 daqiqa)
2. Arxitektura va texnologik tanlov (2 daqiqa)
3. Asosiy biznes flowlar: auth -> listing -> booking -> payment (3 daqiqa)
4. Realtime imkoniyatlar: chat + notifications (1 daqiqa)
5. Test data va demo natijalari (1 daqiqa)
6. Xulosa va keyingi rejalar (1 daqiqa)

## 9. Keyingi Bosqichlar

- Endpoint coverage-ni oshirish (hozir ishlatilmayotgan API'larni frontendga ulash)
- E2E testlarni kuchaytirish (auth, booking, payment flow)
- Payment provider callbacklarini to'liq production hardening
- Admin analytics dashboard endpointlarini to'liq backend bilan moslash

## 10. Xulosa

Mulkchi platformasi MVP darajasida to'liq asosiy flowlarni bajaradi va himoya uchun ishlaydigan, demo ma'lumot bilan to'ldirilgan holatga keltirildi.
