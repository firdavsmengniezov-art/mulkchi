# API Coverage Report

*Oxirgi yangilanish: 2026-04-11 (avtomatik tahlil asosida)*

## 1) Barcha endpointlar

| Method | URL | Controller | FE ishlatadimi |
|---|---|---|---|
| POST | /api/auth/login | AuthController | ✅ auth.service.ts |
| POST | /api/auth/register | AuthController | ✅ auth.service.ts |
| POST | /api/auth/refresh-token | AuthController | ✅ jwt.interceptor.ts |
| POST | /api/auth/logout | AuthController | ✅ auth.service.ts |
| POST | /api/auth/forgot-password | AuthController | ✅ forgot-password.component.ts |
| POST | /api/auth/reset-password | AuthController | ✅ reset-password.component.ts |
| GET | /api/auth/me | AuthController | ✅ auth.service.ts |
| PUT | /api/auth/profile | AuthController | ✅ profile components |
| DELETE | /api/auth/account | AuthController | ✅ profile components |
| GET | /api/properties | PropertiesController | ✅ property.service.ts |
| GET | /api/properties/{id} | PropertiesController | ✅ property.service.ts |
| POST | /api/properties | PropertiesController | ✅ property.service.ts |
| PUT | /api/properties/{id} | PropertiesController | ✅ property.service.ts |
| DELETE | /api/properties/{id} | PropertiesController | ✅ property.service.ts |
| GET | /api/bookings | BookingsController | ✅ booking.service.ts |
| GET | /api/bookings/my | BookingsController | ✅ booking.service.ts |
| GET | /api/bookings/host | BookingsController | ✅ booking.service.ts |
| GET | /api/bookings/{id} | BookingsController | ✅ booking.service.ts |
| POST | /api/bookings | BookingsController | ✅ booking.service.ts |
| POST | /api/bookings/{id}/confirm | BookingsController | ✅ booking.service.ts |
| POST | /api/bookings/{id}/cancel | BookingsController | ✅ booking.service.ts |
| GET | /api/bookings/availability/{propertyId} | BookingsController | ✅ booking.service.ts |
| GET | /api/messages | MessagesController | ✅ message.service.ts |
| GET | /api/messages/conversations | MessagesController | ✅ message.service.ts |
| GET | /api/messages/conversation/{otherUserId} | MessagesController | ✅ message.service.ts |
| GET | /api/messages/{id} | MessagesController | ✅ message.service.ts |
| POST | /api/messages | MessagesController | ✅ message.service.ts |
| POST | /api/messages/upload-attachment | MessagesController | ✅ message.service.ts |
| PUT | /api/messages/{id} | MessagesController | ✅ message.service.ts |
| DELETE | /api/messages/{id} | MessagesController | ✅ message.service.ts |
| GET | /api/notifications | NotificationsController | ✅ notification.service.ts |
| GET | /api/notifications/{id} | NotificationsController | ✅ notification.service.ts |
| POST | /api/notifications | NotificationsController | ✅ notification.service.ts |
| PUT | /api/notifications/{id} | NotificationsController | ✅ notification.service.ts |
| PUT | /api/notifications/{id}/read | NotificationsController | ✅ notification.service.ts |
| PUT | /api/notifications/read-all | NotificationsController | ✅ notification.service.ts |
| DELETE | /api/notifications/{id} | NotificationsController | ✅ notification.service.ts |
| GET | /api/analytics/market-overview | AnalyticsController | ✅ analytics.service.ts |
| GET | /api/analytics/by-region | AnalyticsController | ✅ analytics.service.ts |
| GET | /api/analytics/price-trends | AnalyticsController | ✅ analytics.service.ts |
| POST | /api/analytics/predict-price | AnalyticsController | ✅ analytics.service.ts |
| GET | /api/analytics/model-status | AnalyticsController | ✅ analytics.service.ts |
| POST | /api/analytics/train-model | AnalyticsController | ⚠️ Admin only |
| GET | /api/users | UsersController | ✅ user.service.ts |
| GET | /api/users/me | UsersController | ✅ user.service.ts |
| PUT | /api/users/me | UsersController | ✅ user.service.ts |
| PUT | /api/users/me/avatar | UsersController | ✅ avatar-upload.component.ts |
| GET | /api/users/{id} | UsersController | ✅ user.service.ts |
| DELETE | /api/users/{id} | UsersController | ⚠️ Admin only |
| GET | /api/reviews | ReviewsController | ✅ review.service.ts |
| GET | /api/reviews/{id} | ReviewsController | ✅ review.service.ts |
| POST | /api/reviews | ReviewsController | ✅ review.service.ts |
| PUT | /api/reviews/{id} | ReviewsController | ✅ review.service.ts |
| DELETE | /api/reviews/{id} | ReviewsController | ✅ review.service.ts |
| GET | /api/favorites | FavoritesController | ✅ favorite.service.ts |
| GET | /api/favorites/{id} | FavoritesController | ✅ favorite.service.ts |
| POST | /api/favorites | FavoritesController | ✅ favorite.service.ts |
| PUT | /api/favorites/{id} | FavoritesController | ✅ favorite.service.ts |
| DELETE | /api/favorites/{id} | FavoritesController | ✅ favorite.service.ts |
| GET | /api/payments | PaymentsController | ✅ payment.service.ts |
| GET | /api/payments/{id} | PaymentsController | ✅ payment.service.ts |
| POST | /api/payments | PaymentsController | ✅ payment.service.ts |
| PUT | /api/payments/{id} | PaymentsController | ✅ payment.service.ts |
| DELETE | /api/payments/{id} | PaymentsController | ✅ payment.service.ts |
| POST | /api/payme | PaymeController | ⚠️ Payment gateway |
| POST | /api/click/prepare | ClickController | ⚠️ Payment gateway |
| POST | /api/click/complete | ClickController | ⚠️ Payment gateway |
| GET | /api/propertyimages | PropertyImagesController | ✅ property-image.service.ts |
| GET | /api/propertyimages/{id} | PropertyImagesController | ✅ property-image.service.ts |
| POST | /api/propertyimages | PropertyImagesController | ✅ property-image.service.ts |
| PUT | /api/propertyimages/{id} | PropertyImagesController | ✅ property-image.service.ts |
| DELETE | /api/propertyimages/{id} | PropertyImagesController | ✅ property-image.service.ts |
| POST | /api/propertyimagesupload/upload | PropertyImagesUploadController | ✅ property-image.service.ts |
| GET | /api/propertyviews | PropertyViewsController | ✅ analytics |
| GET | /api/propertyviews/{id} | PropertyViewsController | ✅ analytics |
| POST | /api/propertyviews | PropertyViewsController | ✅ analytics |
| PUT | /api/propertyviews/{id} | PropertyViewsController | ✅ analytics |
| DELETE | /api/propertyviews/{id} | PropertyViewsController | ✅ analytics |
| GET | /api/savedsearches | SavedSearchesController | ✅ saved-search.service.ts |
| GET | /api/savedsearches/{id} | SavedSearchesController | ✅ saved-search.service.ts |
| POST | /api/savedsearches | SavedSearchesController | ✅ saved-search.service.ts |
| PUT | /api/savedsearches/{id} | SavedSearchesController | ✅ saved-search.service.ts |
| DELETE | /api/savedsearches/{id} | SavedSearchesController | ✅ saved-search.service.ts |
| GET | /api/rentalcontracts | RentalContractsController | ✅ rental-contract.service.ts |
| GET | /api/rentalcontracts/{id} | RentalContractsController | ✅ rental-contract.service.ts |
| POST | /api/rentalcontracts | RentalContractsController | ✅ rental-contract.service.ts |
| PUT | /api/rentalcontracts/{id} | RentalContractsController | ✅ rental-contract.service.ts |
| DELETE | /api/rentalcontracts/{id} | RentalContractsController | ✅ rental-contract.service.ts |
| GET | /api/discounts | DiscountsController | ✅ discount.service.ts |
| GET | /api/discounts/{id} | DiscountsController | ✅ discount.service.ts |
| POST | /api/discounts | DiscountsController | ✅ discount.service.ts |
| PUT | /api/discounts/{id} | DiscountsController | ✅ discount.service.ts |
| DELETE | /api/discounts/{id} | DiscountsController | ✅ discount.service.ts |
| GET | /api/discountusages | DiscountUsagesController | ✅ discount-usage.service.ts |
| GET | /api/discountusages/{id} | DiscountUsagesController | ✅ discount-usage.service.ts |
| POST | /api/discountusages | DiscountUsagesController | ✅ discount-usage.service.ts |
| PUT | /api/discountusages/{id} | DiscountUsagesController | ✅ discount-usage.service.ts |
| DELETE | /api/discountusages/{id} | DiscountUsagesController | ✅ discount-usage.service.ts |
| GET | /api/airecommendations | AiRecommendationsController | ✅ ai-recommendation.service.ts |
| GET | /api/airecommendations/{id} | AiRecommendationsController | ✅ ai-recommendation.service.ts |
| POST | /api/airecommendations | AiRecommendationsController | ✅ ai-recommendation.service.ts |
| PUT | /api/airecommendations/{id} | AiRecommendationsController | ✅ ai-recommendation.service.ts |
| DELETE | /api/airecommendations/{id} | AiRecommendationsController | ✅ ai-recommendation.service.ts |
| GET | /api/announcements | AnnouncementsController | ✅ announcement.service.ts |
| GET | /api/announcements/{id} | AnnouncementsController | ✅ announcement.service.ts |
| POST | /api/announcements | AnnouncementsController | ✅ announcement.service.ts |
| PUT | /api/announcements/{id} | AnnouncementsController | ✅ announcement.service.ts |
| DELETE | /api/announcements/{id} | AnnouncementsController | ✅ announcement.service.ts |
| GET | /api/homerequests | HomeRequestsController | ✅ home-request.service.ts |
| GET | /api/homerequests/{id} | HomeRequestsController | ✅ home-request.service.ts |
| POST | /api/homerequests | HomeRequestsController | ✅ home-request.service.ts |
| PUT | /api/homerequests/{id} | HomeRequestsController | ✅ home-request.service.ts |
| DELETE | /api/homerequests/{id} | HomeRequestsController | ✅ home-request.service.ts |
| GET | /health | HealthCheck | ⚠️ Monitoring only |
| GET | /health/database | HealthCheck | ⚠️ Monitoring only |
| GET | /health/file-storage | HealthCheck | ⚠️ Monitoring only |

## 2) Frontendda ISHLATILMAGAN endpointlar

| Method | URL | Izoh |
|---|---|---|
| POST | /api/analytics/train-model | Faqat admin dashboard orqali — UI hali yo'q |
| POST | /api/payme | To'lov gateway webhook — FE to'g'ridan chaqirmaydi |
| POST | /api/click/prepare | To'lov gateway — FE to'g'ridan chaqirmaydi |
| POST | /api/click/complete | To'lov gateway — FE to'g'ridan chaqirmaydi |
| GET | /health* | Monitoring, foydalanuvchi UI'si yo'q |

## 3) SignalR Hublar

| Hub URL | FE xizmati |
|---|---|
| /hubs/chat | signalr.service.ts → chatHub |
| /hubs/notifications | signalr.service.ts → notifHub |

## 4) Natija

- **Jami controller endpointlari**: ~105+
- **Frontendda ishlatilayotgan**: ~100 (≈95%)
- **Frontendda ishlatilmayotgan (monitoring/gateway)**: ~5 (≈5%)
- **Coverage**: **~95%** ✅
