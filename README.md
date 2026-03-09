# Mulkchi API

## Loyiha haqida

Mulkchi API - O'zbekiston ko'chmas mulk platformasi uchun zamonaviy RESTful API. Ushbu platforma orqali foydalanuvchilar ko'chmas mulkni sotib olishi, sotishi, ijaraga berishi va boshqa xizmatlardan foydalanishi mumkin.

### Maqsad
- O'zbekiston bozori uchun to'liq ko'chmas mulk platformasi yaratish
- Zamonaviy texnologiyalar asosida ishonchli va tezkor xizmat ko'rsatish
- Real-time kommunikatsiya va AI texnologiyalarini integratsiyalash
- Xalqaro standartlarga mos ko'p tilli platforma

### Bozor
- **Hudud**: O'zbekiston
- **Foydalanuvchilar**: Mulk egalari, brokerlar, ijarachilar, sotuvchilar
- **Xizmatlar**: Sotib olish, sotish, ijaraga berish, bron qilish, analytics

### Texnologiyalar
- **Backend**: .NET 9, ASP.NET Core Web API
- **Database**: SQL Server, Entity Framework Core
- **Authentication**: JWT Token
- **Real-time**: SignalR
- **AI/ML**: ML.NET, FastTree regression
- **Email**: MailKit
- **Logging**: Serilog
- **Testing**: xUnit, Moq

## Arxitektura

Mulkchi API **The Standard** pattern asosida qurilgan bo'lib, to'g'ri ajratilgan qatlamlarga ega:

```
┌─────────────────────────────────────┐
│           Controllers                │  ← API Endpointlar
├─────────────────────────────────────┤
│             Services                │  ← Business Logic
├─────────────────────────────────────┤
│             Brokers                 │  ← Data Access
├─────────────────────────────────────┤
│             Models                  │  ← Domain Entities
└─────────────────────────────────────┘
```

### Layer Structure

1. **Controllers Layer** (`/Controllers`)
   - HTTP requestlarni qabul qilish
   - Validatsiya va response formatlash
   - Swagger/OpenAPI dokumentatsiyasi

2. **Services Layer** (`/Services/Foundations`)
   - Business logic implementatsiyasi
   - Service-lar orasidagi interaksiya
   - Exception handling

3. **Brokers Layer** (`/Brokers`)
   - **StorageBroker**: Database bilan ishlash
   - **LoggingBroker**: Log yozish
   - **DateTimeBroker**: Vaqt bilan ishlash
   - **EmailBroker**: Email yuborish

4. **Models Layer** (`/Models/Foundations`)
   - Domain entitylar
   - DTO lar
   - Exception lar

## Texnologiyalar

### Core Framework
- **.NET 9**: Eng so'ngi .NET versiyasi
- **ASP.NET Core**: RESTful API uchun
- **Entity Framework Core**: ORM
- **SQL Server**: Asosiy database

### Authentication & Security
- **JWT Bearer Token**: Authentication
- **Role-based Authorization**: Admin/Guest/User rollari
- **BCrypt.Net-Next**: Password hashing
- **Rate Limiting**: DDOS himoyasi

### Real-time & Communication
- **SignalR**: Real-time xabarlar va notificationlar
- **Hubs**: ChatHub, NotificationHub
- **WebSocket**: Real-time ulanish

### AI & Machine Learning
- **ML.NET**: Microsoft ML framework
- **FastTree Regression**: Price prediction algoritmi
- **Singleton ML Model**: Performance uchun cached model

### Additional Technologies
- **MailKit**: Email yuborish (SMTP)
- **Serilog**: Structured logging
- **Swagger/OpenAPI**: API dokumentatsiyasi
- **xUnit**: Unit testing
- **Moq**: Mocking framework

## Modellar (18 ta)

### Core Models
1. **Property** - Ko'chmas mulk asosiy modeli (maydon, xonalar, narx, hudud)
2. **User** - Foydalanuvchi ma'lumotlari (profil, ro'l, aloqa)
3. **Auth** - Authentication modeli (login, register, JWT)

### Business Models
4. **Booking** - Bron qilish (muddat, status, to'lov)
5. **Message** - Xabarlar (chat, sender, receiver)
6. **Notification** - Bildirishnomalar (turi, til, status)
7. **Review** - Sharhlar (reyting, izoh, sana)
8. **Payment** - To'lovlar (turi, miqdor, status)

### Supporting Models
9. **Favorite** - Tanlangan mulklar
10. **SavedSearch** - Saqlangan qidiruvlar
11. **PropertyImage** - Mulk rasmlari
12. **PropertyView** - Ko'rishlar statistikasi
13. **RentalContract** - Ijaraga shartnomalar
14. **Discount** - Chegirmalar
15. **DiscountUsage** - Chegirma foydalanish

### Advanced Models
16. **AiRecommendation** - AI tavsiyalari
17. **Announcement** - E'lonlar
18. **HomeRequest** - Uy so'rovlar

## API Endpointlar (47 ta)

### Authentication (`/api/Auth`)
- `POST /register` - Ro'yxatdan o'tish
- `POST /login` - Tizimga kirish
- `POST /refresh` - Token yangilash
- `POST /logout` - Chiqish
- `POST /forgot-password` - Parolni unutish
- `POST /reset-password` - Parolni tiklash

### Properties (`/api/Properties`)
- `GET /` - Barcha mulklar (pagination)
- `GET /{id}` - Bitta mulk ma'lumotlari
- `POST /` - Yangi mulk qo'shish
- `PUT /{id}` - Mulkni yangilash
- `DELETE /{id}` - Mulkni o'chirish (soft delete)
- `GET /search` - Advanced search

### Bookings (`/api/Bookings`)
- `GET /` - Bronlar ro'yxati
- `POST /` - Yangi bron
- `PUT /{id}` - Bronni yangilash
- `DELETE /{id}` - Bronni bekor qilish

### Messages (`/api/Messages`)
- `GET /` - Xabarlar ro'yxati
- `POST /` - Yangi xabar (real-time yuboriladi)
- `PUT /{id}` - Xabarni yangilash
- `DELETE /{id}` - Xabarni o'chirish

### Notifications (`/api/Notifications`)
- `GET /` - Bildirishnomalar
- `POST /` - Yangi bildirishnoma (real-time yuboriladi)
- `PUT /{id}` - Bildirishnomani o'qilgan deb belgilash
- `DELETE /{id}` - Bildirishnomani o'chirish

### Analytics (`/api/Analytics`)
- `GET /market-overview` - Bozor umumiy ko'rsatkichlari
- `GET /by-region` - Hududlar bo'yicha analytics
- `GET /price-trends` - Narx trendlari
- `POST /predict-price` - AI narx bashorati
- `GET /model-status` - ML model statusi
- `POST /train-model` - Modelni train qilish (Admin only)

### Users (`/api/Users`)
- `GET /` - Foydalanuvchilar ro'yxati
- `GET /{id}` - Foydalanuvchi ma'lumotlari
- `PUT /{id}` - Profilni yangilash
- `DELETE /{id}` - Foydalanuvchini o'chirish

### Additional Controllers
- **Reviews** - Sharhlar va reytinglar
- **Favorites** - Tanlangan mulklar
- **Payments** - To'lov amallari
- **PropertyImages** - Mulk rasmlari
- **PropertyViews** - Ko'rishlar statistikasi
- **SavedSearches** - Saqlangan qidiruvlar
- **RentalContracts** - Ijaraga shartnomalar
- **Discounts** - Chegirma tizimi
- **AiRecommendations** - AI tavsiyalari
- **Announcements** - E'lonlar

## Xususiyatlar

### Authentication & Authorization
- ✅ JWT token based authentication
- ✅ Role-based access control (Admin, Guest, User)
- ✅ Secure password hashing with BCrypt
- ✅ Token refresh mechanism
- ✅ Password reset functionality

### Real-time Communication (SignalR)
- ✅ Real-time notifications
- ✅ Live chat between users
- ✅ Typing indicators
- ✅ Online/offline user status
- ✅ Group conversations
- ✅ Instant message delivery

### AI Price Prediction (ML.NET)
- ✅ Machine learning based price recommendations
- ✅ FastTree regression algorithm
- ✅ Multi-feature analysis (area, rooms, amenities)
- ✅ Region-specific pricing for Uzbekistan
- ✅ Confidence levels and price ranges
- ✅ Cold start handling with rule-based predictions

### Multi-currency Support
- ✅ UZS (Uzbekistan Sum)
- ✅ USD (US Dollar)
- ✅ Real-time exchange rates
- ✅ Currency conversion

### Multi-language Support
- ✅ Uzbek (UZ) - asosiy til
- ✅ Russian (RU)
- ✅ English (EN)
- ✅ Localized notifications
- ✅ Multi-language content

### File Upload
- ✅ Property image uploads
- ✅ Multiple file support
- ✅ Image validation
- ✅ Cloud storage ready

### Soft Delete
- ✅ Logical deletion (mark as deleted)
- ✅ Data recovery capability
- ✅ Audit trail with timestamps

### Pagination
- ✅ Efficient large dataset handling
- ✅ Page number and size configuration
- ✅ Total count metadata

### Advanced Search
- ✅ Multiple criteria search
- ✅ Filter by location, price, type
- ✅ Sorting options
- ✅ Search result highlighting

### Analytics
- ✅ Market overview statistics
- ✅ Regional analytics
- ✅ Price trend analysis
- ✅ Property performance metrics

### Email Notifications
- ✅ SMTP email integration
- ✅ Transactional emails
- ✅ Email templates
- ✅ Multi-language email support

### Rate Limiting
- ✅ API request throttling
- ✅ DDoS protection
- ✅ Configurable limits per endpoint
- ✅ IP-based limiting

### Health Checks
- ✅ Database connectivity check
- ✅ File storage check
- ✅ Application health monitoring
- ✅ Detailed health reporting

### Structured Logging
- ✅ Serilog integration
- ✅ Multiple log sinks (Console, File, Database)
- ✅ Structured log data
- ✅ Error tracking and monitoring

## O'rnatish

### Prerequisites
- .NET 9 SDK
- SQL Server 2019+
- Visual Studio 2022 / VS Code

### Installation Steps

1. **Repository ni clone qilish**
```bash
git clone https://github.com/elshodibodullayev17-dev/Mulkchi.git
cd Mulkchi
```

2. **Dependencies ni install qilish**
```bash
dotnet restore
```

3. **Database migratsiyasi**
```bash
cd Mulkchi.Api
dotnet ef database update
```

4. **Konfiguratsiya**
- `appsettings.json` faylida database connection stringni sozlang
- JWT settingsni konfiguratsiya qiling
- Email settingsni sozlang (agar kerak bo'lsa)

5. **Ishga tushirish**
```bash
dotnet run --project Mulkchi.Api
```

### Environment Variables
```bash
ConnectionStrings__DefaultConnection=Server=...;Database=MulkchiDb;...
JwtSettings__Secret=your-super-secret-key
JwtSettings__Issuer=your-issuer
JwtSettings__Audience=your-audience
EmailSettings__SmtpServer=smtp.gmail.com
EmailSettings__SmtpPort=587
EmailSettings__Username=your-email@gmail.com
EmailSettings__Password=your-app-password
```

## Test

### Test Execution
```bash
dotnet test Mulkchi.Api.Tests.Unit
```

### Test Results
- ✅ **180/180 tests passing**
- ✅ **Unit tests** for all services
- ✅ **Integration tests** for controllers
- ✅ **Mock-based testing** with Moq

### Test Coverage
- Authentication & Authorization
- Business Logic (Services)
- Data Access (Brokers)
- API Endpoints (Controllers)
- Exception Handling

## API Documentation

### Swagger UI
- **URL**: `http://localhost:5009/swagger`
- **Interactive API testing**
- **Complete endpoint documentation**
- **Request/Response schemas**

### API Examples

#### Registration
```bash
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "+998901234567"
}
```

#### Price Prediction
```bash
POST /api/analytics/predict-price
{
  "area": 85,
  "bedrooms": 3,
  "bathrooms": 2,
  "region": 0,
  "hasWifi": true,
  "hasParking": true,
  "isRenovated": true,
  "distanceToCityCenter": 5.2
}
```

#### Property Search
```bash
GET /api/properties/search?region=Tashkent&minPrice=50000&maxPrice=200000&bedrooms=3&page=1&pageSize=20
```

## Deployment

### Docker Support
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "Mulkchi.Api.dll"]
```

### Production Considerations
- **Environment variables** for sensitive data
- **HTTPS** configuration
- **Database backups**
- **Monitoring and logging**
- **Scale-out support**

## Litsenziya

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Liability disclaimer
- ⚠️ Warranty disclaimer

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow existing code style
- Add unit tests for new features
- Update documentation
- Use semantic commit messages

### Code Style
- C# conventions
- Async/await patterns
- Dependency injection
- Exception handling
- Logging best practices

## Support

For support and questions:
- 📧 Email: support@mulkchi.uz
- 🌐 Website: https://mulkchi.uz
- 📱 Telegram: @mulkchi_support

## Roadmap

### Upcoming Features
- 🏗️ **Mobile API** - React Native uchun
- 🤖 **Advanced AI** - More ML features
- 📊 **Advanced Analytics** - Business intelligence
- 🌍 **International Expansion** - New countries
- 🔗 **Third-party Integrations** - CRM, Payment systems

### Technology Updates
- 🚀 .NET 10 migration
- 📱 GraphQL support
- 🔄 Event-driven architecture
- ☁️ Cloud-native deployment

---

**Mulkchi API** - O'zbekiston ko'chmas mulk bozori uchun zamonaviy yechim!

*Build with ❤️ using .NET 9 and modern technologies*
