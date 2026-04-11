# API Coverage Report

## 1) Barcha endpointlar
| Method | URL | Controller | FE ishlatadimi | Fayllar |
|---|---|---|---|---|
| GET | /api/AiRecommendations | AiRecommendations | NO |  |
| POST | /api/AiRecommendations | AiRecommendations | NO |  |
| PUT | /api/AiRecommendations | AiRecommendations | NO |  |
| DELETE | /api/AiRecommendations/{id} | AiRecommendations | NO |  |
| GET | /api/AiRecommendations/{id} | AiRecommendations | NO |  |
| GET | /api/Analytics/by-region | Analytics | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\analytics.service.ts |
| GET | /api/Analytics/market-overview | Analytics | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\analytics.service.ts |
| GET | /api/Analytics/model-status | Analytics | NO |  |
| POST | /api/Analytics/predict-price | Analytics | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\analytics.service.ts |
| GET | /api/Analytics/price-trends | Analytics | NO |  |
| POST | /api/Analytics/train-model | Analytics | NO |  |
| GET | /api/Announcements | Announcements | NO |  |
| POST | /api/Announcements | Announcements | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\announcement.service.ts |
| PUT | /api/Announcements | Announcements | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\announcement.service.ts |
| DELETE | /api/Announcements/{id} | Announcements | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\announcement.service.ts |
| GET | /api/Announcements/{id} | Announcements | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\announcement.service.ts |
| DELETE | /api/Auth/account | Auth | NO |  |
| POST | /api/Auth/forgot-password | Auth | NO |  |
| POST | /api/Auth/login | Auth | NO |  |
| POST | /api/Auth/logout | Auth | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\auth.service.ts |
| GET | /api/Auth/me | Auth | NO |  |
| PUT | /api/Auth/profile | Auth | NO |  |
| POST | /api/Auth/refresh-token | Auth | NO |  |
| POST | /api/Auth/register | Auth | NO |  |
| POST | /api/Auth/reset-password | Auth | NO |  |
| GET | /api/Bookings | Bookings | NO |  |
| POST | /api/Bookings | Bookings | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| GET | /api/Bookings/{id} | Bookings | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| POST | /api/Bookings/{id}/cancel | Bookings | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| POST | /api/Bookings/{id}/confirm | Bookings | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| GET | /api/Bookings/availability/{propertyId} | Bookings | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| GET | /api/Bookings/host | Bookings | NO |  |
| GET | /api/Bookings/my | Bookings | NO |  |
| POST | /api/click/complete | Click | NO |  |
| POST | /api/click/prepare | Click | NO |  |
| GET | /api/Discounts | Discounts | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| POST | /api/Discounts | Discounts | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| PUT | /api/Discounts | Discounts | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| DELETE | /api/Discounts/{id} | Discounts | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| GET | /api/Discounts/{id} | Discounts | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| GET | /api/DiscountUsages | DiscountUsages | NO |  |
| POST | /api/DiscountUsages | DiscountUsages | NO |  |
| PUT | /api/DiscountUsages | DiscountUsages | NO |  |
| DELETE | /api/DiscountUsages/{id} | DiscountUsages | NO |  |
| GET | /api/DiscountUsages/{id} | DiscountUsages | NO |  |
| GET | /api/Favorites | Favorites | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\favorite.service.ts |
| POST | /api/Favorites | Favorites | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\favorite.service.ts |
| PUT | /api/Favorites | Favorites | NO |  |
| DELETE | /api/Favorites/{id} | Favorites | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\favorite.service.ts |
| GET | /api/Favorites/{id} | Favorites | NO |  |
| GET | /api/HomeRequests | HomeRequests | NO |  |
| POST | /api/HomeRequests | HomeRequests | NO |  |
| PUT | /api/HomeRequests | HomeRequests | NO |  |
| DELETE | /api/HomeRequests/{id} | HomeRequests | NO |  |
| GET | /api/HomeRequests/{id} | HomeRequests | NO |  |
| GET | /api/Messages | Messages | NO |  |
| POST | /api/Messages | Messages | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\message.service.ts |
| PUT | /api/Messages | Messages | NO |  |
| DELETE | /api/Messages/{id} | Messages | NO |  |
| GET | /api/Messages/{id} | Messages | NO |  |
| POST | /api/Messages/upload-attachment | Messages | NO |  |
| GET | /api/Notifications | Notifications | NO |  |
| POST | /api/Notifications | Notifications | NO |  |
| PUT | /api/Notifications | Notifications | NO |  |
| DELETE | /api/Notifications/{id} | Notifications | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\notification.service.ts |
| GET | /api/Notifications/{id} | Notifications | NO |  |
| POST | /api/payme | Payme | NO |  |
| GET | /api/Payments | Payments | NO |  |
| POST | /api/Payments | Payments | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\payment.service.ts |
| PUT | /api/Payments | Payments | NO |  |
| DELETE | /api/Payments/{id} | Payments | NO |  |
| GET | /api/Payments/{id} | Payments | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\payment.service.ts |
| GET | /api/Properties | Properties | NO |  |
| POST | /api/Properties | Properties | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property.service.ts |
| GET | /api/Properties/{id:guid} | Properties | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property.service.ts |
| GET | /api/Properties/{id:guid}/similar | Properties | NO |  |
| GET | /api/Properties/autocomplete | Properties | NO |  |
| GET | /api/Properties/featured | Properties | NO |  |
| GET | /api/Properties/search | Properties | NO |  |
| GET | /api/PropertyImages | PropertyImages | NO |  |
| POST | /api/PropertyImages | PropertyImages | NO |  |
| PUT | /api/PropertyImages | PropertyImages | NO |  |
| DELETE | /api/PropertyImages/{id} | PropertyImages | NO |  |
| GET | /api/PropertyImages/{id} | PropertyImages | NO |  |
| DELETE | /api/PropertyImagesUpload/{id} | PropertyImagesUpload | NO |  |
| POST | /api/PropertyImagesUpload/upload | PropertyImagesUpload | NO |  |
| GET | /api/PropertyViews | PropertyViews | NO |  |
| POST | /api/PropertyViews | PropertyViews | NO |  |
| PUT | /api/PropertyViews | PropertyViews | NO |  |
| DELETE | /api/PropertyViews/{id} | PropertyViews | NO |  |
| GET | /api/PropertyViews/{id} | PropertyViews | NO |  |
| GET | /api/RentalContracts | RentalContracts | NO |  |
| POST | /api/RentalContracts | RentalContracts | NO |  |
| PUT | /api/RentalContracts | RentalContracts | NO |  |
| DELETE | /api/RentalContracts/{id} | RentalContracts | NO |  |
| GET | /api/RentalContracts/{id} | RentalContracts | NO |  |
| GET | /api/Reviews | Reviews | NO |  |
| POST | /api/Reviews | Reviews | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\review.service.ts |
| PUT | /api/Reviews | Reviews | NO |  |
| DELETE | /api/Reviews/{id} | Reviews | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\review.service.ts |
| GET | /api/Reviews/{id} | Reviews | NO |  |
| GET | /api/SavedSearches | SavedSearches | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\saved-search.service.ts |
| POST | /api/SavedSearches | SavedSearches | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\saved-search.service.ts |
| PUT | /api/SavedSearches | SavedSearches | NO |  |
| DELETE | /api/SavedSearches/{id} | SavedSearches | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\saved-search.service.ts |
| GET | /api/SavedSearches/{id} | SavedSearches | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\saved-search.service.ts |
| PUT | /api/SavedSearches/{id}/toggle | SavedSearches | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\saved-search.service.ts |
| GET | /api/Users | Users | NO |  |
| DELETE | /api/Users/{id:guid} | Users | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\user.service.ts |
| GET | /api/Users/{id:guid} | Users | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\user.service.ts |
| GET | /api/Users/me | Users | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\user.service.ts |
| PUT | /api/Users/me | Users | YES | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\user.service.ts |
| PUT | /api/Users/me/avatar | Users | NO |  |

## 2) Frontendda ISHLATILMAGAN (75 ta)
| Method | URL | Controller |
|---|---|---|
| GET | /api/AiRecommendations | AiRecommendations |
| POST | /api/AiRecommendations | AiRecommendations |
| PUT | /api/AiRecommendations | AiRecommendations |
| DELETE | /api/AiRecommendations/{id} | AiRecommendations |
| GET | /api/AiRecommendations/{id} | AiRecommendations |
| GET | /api/Analytics/model-status | Analytics |
| GET | /api/Analytics/price-trends | Analytics |
| POST | /api/Analytics/train-model | Analytics |
| GET | /api/Announcements | Announcements |
| DELETE | /api/Auth/account | Auth |
| POST | /api/Auth/forgot-password | Auth |
| POST | /api/Auth/login | Auth |
| GET | /api/Auth/me | Auth |
| PUT | /api/Auth/profile | Auth |
| POST | /api/Auth/refresh-token | Auth |
| POST | /api/Auth/register | Auth |
| POST | /api/Auth/reset-password | Auth |
| GET | /api/Bookings | Bookings |
| GET | /api/Bookings/host | Bookings |
| GET | /api/Bookings/my | Bookings |
| POST | /api/click/complete | Click |
| POST | /api/click/prepare | Click |
| GET | /api/DiscountUsages | DiscountUsages |
| POST | /api/DiscountUsages | DiscountUsages |
| PUT | /api/DiscountUsages | DiscountUsages |
| DELETE | /api/DiscountUsages/{id} | DiscountUsages |
| GET | /api/DiscountUsages/{id} | DiscountUsages |
| PUT | /api/Favorites | Favorites |
| GET | /api/Favorites/{id} | Favorites |
| GET | /api/HomeRequests | HomeRequests |
| POST | /api/HomeRequests | HomeRequests |
| PUT | /api/HomeRequests | HomeRequests |
| DELETE | /api/HomeRequests/{id} | HomeRequests |
| GET | /api/HomeRequests/{id} | HomeRequests |
| GET | /api/Messages | Messages |
| PUT | /api/Messages | Messages |
| DELETE | /api/Messages/{id} | Messages |
| GET | /api/Messages/{id} | Messages |
| POST | /api/Messages/upload-attachment | Messages |
| GET | /api/Notifications | Notifications |
| POST | /api/Notifications | Notifications |
| PUT | /api/Notifications | Notifications |
| GET | /api/Notifications/{id} | Notifications |
| POST | /api/payme | Payme |
| GET | /api/Payments | Payments |
| PUT | /api/Payments | Payments |
| DELETE | /api/Payments/{id} | Payments |
| GET | /api/Properties | Properties |
| GET | /api/Properties/{id:guid}/similar | Properties |
| GET | /api/Properties/autocomplete | Properties |
| GET | /api/Properties/featured | Properties |
| GET | /api/Properties/search | Properties |
| GET | /api/PropertyImages | PropertyImages |
| POST | /api/PropertyImages | PropertyImages |
| PUT | /api/PropertyImages | PropertyImages |
| DELETE | /api/PropertyImages/{id} | PropertyImages |
| GET | /api/PropertyImages/{id} | PropertyImages |
| DELETE | /api/PropertyImagesUpload/{id} | PropertyImagesUpload |
| POST | /api/PropertyImagesUpload/upload | PropertyImagesUpload |
| GET | /api/PropertyViews | PropertyViews |
| POST | /api/PropertyViews | PropertyViews |
| PUT | /api/PropertyViews | PropertyViews |
| DELETE | /api/PropertyViews/{id} | PropertyViews |
| GET | /api/PropertyViews/{id} | PropertyViews |
| GET | /api/RentalContracts | RentalContracts |
| POST | /api/RentalContracts | RentalContracts |
| PUT | /api/RentalContracts | RentalContracts |
| DELETE | /api/RentalContracts/{id} | RentalContracts |
| GET | /api/RentalContracts/{id} | RentalContracts |
| GET | /api/Reviews | Reviews |
| PUT | /api/Reviews | Reviews |
| GET | /api/Reviews/{id} | Reviews |
| PUT | /api/SavedSearches | SavedSearches |
| GET | /api/Users | Users |
| PUT | /api/Users/me/avatar | Users |

## 3) Frontendda bor, backendda YO'Q
| Method | URL | Fayl |
|---|---|---|
| GET | /api/assets/i18n/{var}.json | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\app.config.ts |
| DELETE | /api/ai-recommendations/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\ai-recommendation.service.ts |
| PUT | /api/bookings | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| DELETE | /api/bookings/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\booking.service.ts |
| GET | /api/analytics/realtime | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\dashboard-analytics.service.ts |
| GET | /api/discounts/active | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| POST | /api/discounts/validate | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount.service.ts |
| POST | /api/discount-usages | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount-usage.service.ts |
| GET | /api/discount-usages/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount-usage.service.ts |
| GET | /api/discount-usages/my | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\discount-usage.service.ts |
| POST | /api/home-requests | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\home-request.service.ts |
| PUT | /api/home-requests | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\home-request.service.ts |
| DELETE | /api/home-requests/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\home-request.service.ts |
| GET | /api/home-requests/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\home-request.service.ts |
| GET | /api/home-requests/my | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\home-request.service.ts |
| PUT | /api/notifications/{var}/read | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\notification.service.ts |
| PUT | /api/notifications/read-all | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\notification.service.ts |
| PUT | /api/payments/{var}/cancel | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\payment.service.ts |
| GET | /api/payments/booking/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\payment.service.ts |
| GET | /api/payments/summary | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\payment.service.ts |
| DELETE | /api/properties/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property.service.ts |
| PUT | /api/properties/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property.service.ts |
| POST | /api/property-images | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property-image.service.ts |
| PUT | /api/property-images | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property-image.service.ts |
| DELETE | /api/property-images/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property-image.service.ts |
| GET | /api/property-images/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\property-image.service.ts |
| POST | /api/rental-contracts | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| PUT | /api/rental-contracts | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| DELETE | /api/rental-contracts/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| GET | /api/rental-contracts/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| GET | /api/rental-contracts/{var}/pdf | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| POST | /api/rental-contracts/{var}/sign | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| PATCH | /api/rental-contracts/{var}/status | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| POST | /api/rental-contracts/{var}/terminate | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| GET | /api/rental-contracts/by-booking/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| GET | /api/rental-contracts/by-user/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| POST | /api/rental-contracts/from-booking/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| GET | /api/rental-contracts/templates | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\rental-contract.service.ts |
| PUT | /api/reviews/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\review.service.ts |
| GET | /api/reviews/property/{var}/summary | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\review.service.ts |
| PUT | /api/savedsearches/{var} | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\saved-search.service.ts |
| POST | /api/users | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\user.service.ts |
| PUT | /api/users | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\core\services\user.service.ts |
| POST | /api/properties/{var}/views | C:\Bitiruv malakaviy ishi\Mulkchi\Mulkchi.Frontend\src\app\features\properties\property-detail\property-detail-page.component.ts |

## 4) Natija
- Jami: **113**
- Ishlatilayotgan: **38**
- Ishlatilmayotgan: **75**
- Coverage: **33.63%**
