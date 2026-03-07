# Mulkchi – Comprehensive Project Report

> O'zbekiston uchun ko'chmas mulk platformasi — uy-joy sotish, ijara va agent tizimi.  
> Built with ASP.NET Core 9 + Clean Architecture ("The Standard").

---

## Table of Contents

1. [Solution Structure](#1-solution-structure)
2. [Mulkchi.Api Project](#2-mulkchiapi-project)
3. [Database](#3-database)
4. [Models Detail](#4-models-detail)
5. [Services Detail](#5-services-detail)
6. [Unit Tests](#6-unit-tests)
7. [NuGet Packages](#7-nuget-packages)
8. [Architecture Summary](#8-architecture-summary)
9. [What Is Missing / Potential Improvements](#9-what-is-missing--potential-improvements)

---

## 1. Solution Structure

### Solution Files

| File | Format |
|---|---|
| `Mulkchi.sln` | Classic Visual Studio solution (Format Version 12.00, VS 2022) |
| `Mulkchi.slnx` | Modern XML solution format |

### Projects

| Project | GUID | Type | Purpose |
|---|---|---|---|
| **Mulkchi.Api** | `B0305630-0AF8-4352-B7D8-9F5C0E691DF9` | ASP.NET Core Web API (.NET 9.0) | Main REST API + SignalR hub |
| **Mulkchi.Api.Tests.Unit** | `E3F58683-3071-41EC-8C6A-F9456F2C3698` | xUnit Test Project (.NET 9.0) | Foundation-service unit tests (120 files) |
| **Mulkchi.Api.Infrastructure.Build** | `AAB727C9-DC72-4277-880F-F42FEEF03310` | Build Infrastructure Project | CI/CD build scripts and tooling |

---

## 2. Mulkchi.Api Project

### Top-Level Directory Tree

```
Mulkchi.Api/
├── Brokers/
│   ├── DateTimes/          # IDateTimeBroker, DateTimeBroker
│   ├── Loggings/           # ILoggingBroker, LoggingBroker
│   └── Storages/           # StorageBroker (DbContext) + 15 partial classes
├── Controllers/            # 15 REST API controllers
├── Hubs/
│   └── ChatHub.cs          # SignalR real-time hub
├── Models/
│   └── Foundations/        # 15 domain models + enums + exception classes
├── Services/
│   └── Foundations/        # 15 service interfaces + implementations
├── Properties/             # launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── Mulkchi.Api.csproj
├── Mulkchi.Api.http
├── Program.cs
└── Startup.cs
```

---

### Brokers

#### A. DateTime Broker

**`Brokers/DateTimes/IDateTimeBroker.cs`**

```csharp
public interface IDateTimeBroker
{
    DateTimeOffset GetCurrentDateTimeOffset();
}
```

**`Brokers/DateTimes/DateTimeBroker.cs`**

```csharp
public class DateTimeBroker : IDateTimeBroker
{
    public DateTimeOffset GetCurrentDateTimeOffset() => DateTimeOffset.UtcNow;
}
```

Registration: `services.AddTransient<IDateTimeBroker, DateTimeBroker>()`

---

#### B. Logging Broker

**`Brokers/Loggings/ILoggingBroker.cs`**

```csharp
public interface ILoggingBroker
{
    void LogInformation(string message);
    void LogWarning(string message);
    void LogError(Exception exception);
    void LogCritical(Exception exception);
}
```

**`Brokers/Loggings/LoggingBroker.cs`**

- Depends on `ILogger<LoggingBroker>` (Microsoft.Extensions.Logging)
- Delegates to the standard ASP.NET Core logging infrastructure

Registration: `services.AddTransient<ILoggingBroker, LoggingBroker>()`

---

#### C. Storage Broker (Database Layer)

**`Brokers/Storages/StorageBroker.cs`** – main `DbContext`

```csharp
public partial class StorageBroker : DbContext, IStorageBroker
{
    // Configures SQL Server connection from IConfiguration
    // Calls Database.EnsureCreated() in Development environment
    // Configures decimal precision (18,2) for all money fields
}
```

**Partial class files (one per entity):**

| Entity | Interface File | Implementation File |
|---|---|---|
| User | `IStorageBroker.Users.cs` | `StorageBroker.Users.cs` |
| Property | `IStorageBroker.Properties.cs` | `StorageBroker.Properties.cs` |
| Message | `IStorageBroker.Messages.cs` | `StorageBroker.Messages.cs` |
| Payment | `IStorageBroker.Payments.cs` | `StorageBroker.Payments.cs` |
| Review | `IStorageBroker.Reviews.cs` | `StorageBroker.Reviews.cs` |
| RentalContract | `IStorageBroker.RentalContracts.cs` | `StorageBroker.RentalContracts.cs` |
| Favorite | `IStorageBroker.Favorites.cs` | `StorageBroker.Favorites.cs` |
| SavedSearch | `IStorageBroker.SavedSearches.cs` | `StorageBroker.SavedSearches.cs` |
| PropertyImage | `IStorageBroker.PropertyImages.cs` | `StorageBroker.PropertyImages.cs` |
| PropertyView | `IStorageBroker.PropertyViews.cs` | `StorageBroker.PropertyViews.cs` |
| Notification | `IStorageBroker.Notifications.cs` | `StorageBroker.Notifications.cs` |
| HomeRequest | `IStorageBroker.HomeRequests.cs` | `StorageBroker.HomeRequests.cs` |
| AiRecommendation | `IStorageBroker.AiRecommendations.cs` | `StorageBroker.AiRecommendations.cs` |
| Discount | `IStorageBroker.Discounts.cs` | `StorageBroker.Discounts.cs` |
| Announcement | `IStorageBroker.Announcements.cs` | `StorageBroker.Announcements.cs` |

Each partial interface declares five CRUD methods:
`InsertXxxAsync`, `SelectAllXxxs`, `SelectXxxByIdAsync`, `UpdateXxxAsync`, `DeleteXxxByIdAsync`

Registration: `services.AddScoped<IStorageBroker, StorageBroker>()`

---

### Controllers (15 total)

All controllers follow `[ApiController] [Route("api/[controller]")]`.

Standard CRUD endpoints per controller:

| Method | Route | Action |
|---|---|---|
| `POST` | `api/{resource}` | Create |
| `GET` | `api/{resource}` | Get all |
| `GET` | `api/{resource}/{id:guid}` | Get by ID |
| `PUT` | `api/{resource}` | Update |
| `DELETE` | `api/{resource}/{id:guid}` | Delete by ID |

Standard error-to-HTTP mapping:

| Exception | HTTP Status |
|---|---|
| `XxxValidationException` | 400 Bad Request |
| `XxxDependencyValidationException` | 400 Bad Request |
| `NotFoundXxxException` | 404 Not Found |
| `XxxDependencyException` | 500 Internal Server Error |
| `XxxServiceException` | 500 Internal Server Error |

#### Controller List

| # | File | Base Route |
|---|---|---|
| 1 | `UsersController.cs` | `api/users` |
| 2 | `PropertiesController.cs` | `api/properties` |
| 3 | `HomeRequestsController.cs` | `api/homerequests` |
| 4 | `PaymentsController.cs` | `api/payments` |
| 5 | `ReviewsController.cs` | `api/reviews` |
| 6 | `MessagesController.cs` | `api/messages` |
| 7 | `NotificationsController.cs` | `api/notifications` |
| 8 | `RentalContractsController.cs` | `api/rentalcontracts` |
| 9 | `FavoritesController.cs` | `api/favorites` |
| 10 | `SavedSearchesController.cs` | `api/savedsearches` |
| 11 | `PropertyImagesController.cs` | `api/propertyimages` |
| 12 | `PropertyViewsController.cs` | `api/propertyviews` |
| 13 | `AiRecommendationsController.cs` | `api/airecommendations` |
| 14 | `DiscountsController.cs` | `api/discounts` |
| 15 | `AnnouncementsController.cs` | `api/announcements` |

---

### Hubs/ChatHub.cs

```csharp
public class ChatHub : Hub
{
    private readonly IMessageService messageService;
    private readonly ILoggingBroker loggingBroker;

    // Hub WebSocket endpoint: /hub

    public async Task SendMessage(Guid senderId, Guid receiverId, string content)
    // Creates Message(MessageType.Text), persists via messageService.AddMessageAsync()
    // Sends "ReceiveMessage" to Clients.User(receiverId)
    // Sends "MessageSent" to Clients.Caller

    public async Task JoinPropertyRoom(Guid propertyId)
    // Groups.AddToGroupAsync(connectionId, propertyId.ToString())
    // Broadcasts "UserJoined" to property group

    public async Task LeavePropertyRoom(Guid propertyId)
    // Groups.RemoveFromGroupAsync(connectionId, propertyId.ToString())
    // Broadcasts "UserLeft" to property group

    public async Task SendTypingIndicator(Guid receiverId, bool isTyping)
    // Sends "UserTyping" signal with sender id and isTyping flag

    public async Task MarkAsRead(Guid messageId)
    // Retrieves message, sets IsRead=true, ReadAt=UtcNow, updates via messageService
    // Notifies original sender with "MessageRead"

    public override async Task OnConnectedAsync()
    // Logs connection with ConnectionId

    public override async Task OnDisconnectedAsync(Exception? exception)
    // Logs disconnection, logs exception if present
}
```

---

### Startup.cs

```csharp
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        AddSwagger(services);          // Swagger/OpenAPI + JWT Bearer docs
        AddJwtAuthentication(services);// JWT Bearer token validation
        AddDbContext(services);        // SQL Server + IStorageBroker
        AddBrokers(services);          // ILoggingBroker, IDateTimeBroker
        AddFoundationServices(services);// All 15 scoped services
        services.AddSignalR();         // Real-time SignalR
        AddCors(services);             // CORS "AllowAll" policy
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
        app.UseHttpsRedirection();
        app.UseCors("AllowAll");
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ChatHub>("/hub");
        });
    }
}
```

---

### Program.cs

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var startup = new Startup(builder.Configuration);
        startup.ConfigureServices(builder.Services);
        var app = builder.Build();
        startup.Configure(app, app.Environment);
        app.Run();
    }
}
```

---

## 3. Database

### Connection String (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MulkchiDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

| Setting | Value |
|---|---|
| Server | `(localdb)\mssqllocaldb` – Microsoft SQL Server LocalDB |
| Database | `MulkchiDb` |
| Authentication | `Trusted_Connection=True` – Windows Authentication |
| MARS | `MultipleActiveResultSets=true` |

### All 15 Database Tables (DbSets)

| # | Table / DbSet | Entity | Key Purpose |
|---|---|---|---|
| 1 | `Users` | `User` | Hosts, guests, admins |
| 2 | `Properties` | `Property` | Real estate listings |
| 3 | `Messages` | `Message` | Direct messaging |
| 4 | `Payments` | `Payment` | Payment records |
| 5 | `Reviews` | `Review` | Property reviews |
| 6 | `RentalContracts` | `RentalContract` | Long-term rental agreements |
| 7 | `Favorites` | `Favorite` | User saved properties |
| 8 | `SavedSearches` | `SavedSearch` | Persistent search filters |
| 9 | `PropertyImages` | `PropertyImage` | Listing image metadata |
| 10 | `PropertyViews` | `PropertyView` | Impression tracking |
| 11 | `Notifications` | `Notification` | Push notifications |
| 12 | `HomeRequests` | `HomeRequest` | Booking / inquiry requests |
| 13 | `AiRecommendations` | `AiRecommendation` | ML-powered suggestions |
| 14 | `Discounts` | `Discount` | Promo codes / offers |
| 15 | `Announcements` | `Announcement` | Platform-wide alerts |

**Additional implied table:** `DiscountUsages` (entity `DiscountUsage` exists in the Discounts model folder but no dedicated `DbSet` was observed — candidate for completion).

### Decimal Precision Configuration (18, 2)

All monetary and rating fields in `OnModelCreating`:
- `Payment`: `Amount`, `PlatformFee`, `HostReceives`
- `Property`: `MonthlyRent`, `SalePrice`, `PricePerNight`, `SecurityDeposit`, `AverageRating`
- `RentalContract`: `MonthlyRent`, `SecurityDeposit`
- `HomeRequest`: `TotalPrice`
- `Review`: All six rating fields
- `User`: `Rating`, `ResponseRate`
- `AiRecommendation`: `Score`
- `Discount`: `Value`, `MaxDiscountAmount`

### Migrations Folder

**Status: No migration files exist.**  
The project uses `Database.EnsureCreated()` (called in `StorageBroker` constructor only when `IWebHostEnvironment.IsDevelopment() == true`) to create the schema from model definitions at runtime. No `Migrations/` folder is present.

---

## 4. Models Detail

All models reside in `Models/Foundations/<EntityPlural>/`.  
Each model includes: the entity class, related enums, and 10 Xeption-based exception classes.

---

### 4.1 User

**File:** `Models/Foundations/Users/User.cs`

| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `FirstName` | `string` | |
| `LastName` | `string` | |
| `Email` | `string` | |
| `Phone` | `string` | |
| `PasswordHash` | `string` | |
| `AvatarUrl` | `string` | |
| `Bio` | `string` | |
| `Address` | `string` | |
| `DateOfBirth` | `DateTimeOffset?` | |
| `Gender` | `Gender` | Enum |
| `IsVerified` | `bool` | |
| `Role` | `UserRole` | Enum |
| `Badge` | `HostBadge` | Enum |
| `Rating` | `decimal` | |
| `ResponseRate` | `decimal` | |
| `ResponseTimeMinutes` | `int` | |
| `TotalListings` | `int` | |
| `TotalBookings` | `int` | |
| `HostSince` | `DateTimeOffset?` | |
| `PreferredLanguage` | `string` | `"uz"`, `"ru"`, `"en"` |
| `CreatedDate` | `DateTimeOffset` | |
| `UpdatedDate` | `DateTimeOffset` | |
| `DeletedDate` | `DateTimeOffset?` | Soft delete |

**Enums:**

| Enum | Values |
|---|---|
| `Gender` | `Male`, `Female`, `Other`, `PreferNotToSay` |
| `UserRole` | `Guest`, `Host`, `Admin` |
| `HostBadge` | `None`, `NewHost`, `SuperHost`, `PremiumHost` |

**Exceptions (10):**

| Class | Base |
|---|---|
| `NullUserException` | `Xeption` |
| `InvalidUserException` | `Xeption` |
| `NotFoundUserException` | `Xeption` |
| `AlreadyExistsUserException` | `Xeption` |
| `FailedUserStorageException` | `Xeption` |
| `FailedUserServiceException` | `Xeption` |
| `UserValidationException` | `Xeption` (wraps inner) |
| `UserDependencyValidationException` | `Xeption` (wraps inner) |
| `UserDependencyException` | `Xeption` (wraps inner) |
| `UserServiceException` | `Xeption` (wraps inner) |

---

### 4.2 Property

**File:** `Models/Foundations/Properties/Property.cs`

| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | |
| `Title` | `string` | |
| `Description` | `string` | |
| `Type` | `PropertyType` | Enum |
| `Category` | `PropertyCategory` | Enum |
| `Status` | `PropertyStatus` | Enum |
| `ListingType` | `ListingType` | Enum |
| `MonthlyRent` | `decimal?` | |
| `SalePrice` | `decimal?` | |
| `PricePerNight` | `decimal?` | |
| `SecurityDeposit` | `decimal?` | |
| `Area` | `double` | |
| `NumberOfBedrooms` | `int` | |
| `NumberOfBathrooms` | `int` | |
| `MaxGuests` | `int` | |
| `Region` | `UzbekistanRegion` | Enum |
| `City` | `string` | |
| `District` | `string` | |
| `Address` | `string` | |
| `Mahalla` | `string` | Uzbek: neighbourhood |
| `Latitude` | `double?` | |
| `Longitude` | `double?` | |
| `HasWifi` | `bool` | |
| `HasParking` | `bool` | |
| `HasPool` | `bool` | |
| `PetsAllowed` | `bool` | |
| `IsInstantBook` | `bool` | |
| `IsVacant` | `bool` | |
| `IsFeatured` | `bool` | |
| `IsVerified` | `bool` | |
| `HasMetroNearby` | `bool` | Uzbekistan infra |
| `HasBusStop` | `bool` | |
| `HasMarketNearby` | `bool` | |
| `HasSchoolNearby` | `bool` | |
| `HasHospitalNearby` | `bool` | |
| `DistanceToCityCenter` | `double?` | |
| `HasElevator` | `bool` | |
| `HasSecurity` | `bool` | |
| `HasGenerator` | `bool` | |
| `HasGas` | `bool` | |
| `HasFurniture` | `bool` | |
| `IsRenovated` | `bool` | |
| `HasAirConditioning` | `bool` | |
| `HasHeating` | `bool` | |
| `HasWasher` | `bool` | |
| `HasKitchen` | `bool` | |
| `HasTV` | `bool` | |
| `HasWorkspace` | `bool` | |
| `IsSelfCheckIn` | `bool` | |
| `IsChildFriendly` | `bool` | |
| `IsAccessible` | `bool` | |
| `AverageRating` | `decimal` | |
| `ViewsCount` | `int` | |
| `FavoritesCount` | `int` | |
| `HostId` | `Guid` | FK → Users |
| `CreatedDate` | `DateTimeOffset` | |
| `UpdatedDate` | `DateTimeOffset` | |
| `DeletedDate` | `DateTimeOffset?` | |

**Enums:**

| Enum | Values |
|---|---|
| `PropertyType` | `Apartment`, `House`, `Villa`, `Room`, `Office`, `Land`, `Commercial` |
| `PropertyCategory` | `Residential`, `Commercial`, `Industrial`, `Agricultural` |
| `PropertyStatus` | `Active`, `Inactive`, `Pending`, `Rejected`, `Deleted` |
| `ListingType` | `Rent`, `Sale`, `ShortTermRent` |
| `UzbekistanRegion` | `ToshkentShahar`, `ToshkentViloyat`, `Samarqand`, `Buxoro`, `Andijon`, `Fargona`, `Namangan`, `Qashqadaryo`, `Surxondaryo`, `Xorazm`, `Navoiy`, `Jizzax`, `Sirdaryo`, `Qoraqalpogiston` |

**Exceptions (10):** Same pattern — `NullPropertyException`, `InvalidPropertyException`, `NotFoundPropertyException`, `AlreadyExistsPropertyException`, `FailedPropertyStorageException`, `FailedPropertyServiceException`, `PropertyValidationException`, `PropertyDependencyValidationException`, `PropertyDependencyException`, `PropertyServiceException`.

---

### 4.3 Message

**File:** `Models/Foundations/Messages/Message.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Content` | `string` |
| `Type` | `MessageType` |
| `IsRead` | `bool` |
| `ReadAt` | `DateTimeOffset?` |
| `SenderId` | `Guid` |
| `ReceiverId` | `Guid` |
| `PropertyId` | `Guid?` |
| `HomeRequestId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enum:** `MessageType` → `Text`, `Image`, `File`, `System`

**Exceptions (10):** `NullMessageException`, `InvalidMessageException`, `NotFoundMessageException`, `AlreadyExistsMessageException`, `FailedMessageStorageException`, `FailedMessageServiceException`, `MessageValidationException`, `MessageDependencyValidationException`, `MessageDependencyException`, `MessageServiceException`.

---

### 4.4 Payment

**File:** `Models/Foundations/Payments/Payment.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Amount` | `decimal` |
| `PlatformFee` | `decimal` |
| `HostReceives` | `decimal` |
| `Type` | `PaymentType` |
| `Status` | `PaymentStatus` |
| `Method` | `PaymentMethod` |
| `IsEscrowHeld` | `bool` |
| `EscrowReleasedAt` | `DateTimeOffset?` |
| `ExternalTransactionId` | `string` |
| `PaymentUrl` | `string` |
| `PayerId` | `Guid` |
| `ReceiverId` | `Guid` |
| `HomeRequestId` | `Guid?` |
| `ContractId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enums:**

| Enum | Values |
|---|---|
| `PaymentType` | `BookingPayment`, `SecurityDeposit`, `Refund`, `PlatformFee` |
| `PaymentStatus` | `Pending`, `Processing`, `Completed`, `Failed`, `Refunded`, `Cancelled` |
| `PaymentMethod` | `Payme`, `Click`, `Uzcard`, `Humo`, `Cash` |

**Exceptions (10):** Standard pattern for `Payment`.

---

### 4.5 Review

**File:** `Models/Foundations/Reviews/Review.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `OverallRating` | `decimal` |
| `CleanlinessRating` | `decimal` |
| `LocationRating` | `decimal` |
| `ValueRating` | `decimal` |
| `CommunicationRating` | `decimal` |
| `AccuracyRating` | `decimal` |
| `Comment` | `string` |
| `IsVerifiedStay` | `bool` |
| `HostResponse` | `string` |
| `HostRespondedAt` | `DateTimeOffset?` |
| `ReviewerId` | `Guid` |
| `PropertyId` | `Guid` |
| `HomeRequestId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Exceptions (10):** Standard pattern for `Review`.

---

### 4.6 RentalContract

**File:** `Models/Foundations/RentalContracts/RentalContract.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Status` | `ContractStatus` |
| `StartDate` | `DateTimeOffset` |
| `EndDate` | `DateTimeOffset` |
| `MonthlyRent` | `decimal` |
| `SecurityDeposit` | `decimal` |
| `Terms` | `string` |
| `DocumentUrl` | `string` |
| `IsSigned` | `bool` |
| `SignedAt` | `DateTimeOffset?` |
| `TenantId` | `Guid` |
| `LandlordId` | `Guid` |
| `PropertyId` | `Guid` |
| `HomeRequestId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enum:** `ContractStatus` → `Draft`, `Pending`, `Active`, `Expired`, `Terminated`, `Cancelled`

**Exceptions (10):** Standard pattern for `RentalContract`.

---

### 4.7 Favorite

**File:** `Models/Foundations/Favorites/Favorite.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `UserId` | `Guid` |
| `PropertyId` | `Guid` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Exceptions (10):** Standard pattern for `Favorite`.

---

### 4.8 HomeRequest

**File:** `Models/Foundations/HomeRequests/HomeRequest.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Type` | `RequestType` |
| `Status` | `RequestStatus` |
| `CheckInDate` | `DateTimeOffset?` |
| `CheckOutDate` | `DateTimeOffset?` |
| `TotalNights` | `int?` |
| `GuestCount` | `int` |
| `TotalPrice` | `decimal` |
| `Message` | `string` |
| `RejectionReason` | `string` |
| `CancellationReason` | `string` |
| `GuestId` | `Guid` |
| `HostId` | `Guid` |
| `PropertyId` | `Guid` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enums:**

| Enum | Values |
|---|---|
| `RequestType` | `Booking`, `Inquiry`, `ShortTermRent` |
| `RequestStatus` | `Pending`, `Approved`, `Rejected`, `Cancelled`, `Completed` |

**Exceptions (10):** Standard pattern for `HomeRequest`.

---

### 4.9 PropertyImage

**File:** `Models/Foundations/PropertyImages/PropertyImage.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Url` | `string` |
| `Caption` | `string` |
| `SortOrder` | `int` |
| `IsPrimary` | `bool` |
| `PropertyId` | `Guid` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Exceptions (10):** Standard pattern for `PropertyImage`.

---

### 4.10 PropertyView

**File:** `Models/Foundations/PropertyViews/PropertyView.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `IpAddress` | `string` |
| `UserAgent` | `string` |
| `PropertyId` | `Guid` |
| `UserId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Exceptions (10):** Standard pattern for `PropertyView`.

---

### 4.11 SavedSearch

**File:** `Models/Foundations/SavedSearches/SavedSearch.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Name` | `string` |
| `SearchQuery` | `string` |
| `NotifyOnMatch` | `bool` |
| `UserId` | `Guid` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Exceptions (10):** Standard pattern for `SavedSearch`.

---

### 4.12 Notification

**File:** `Models/Foundations/Notifications/Notification.cs`

| Field | Type | Notes |
|---|---|---|
| `Id` | `Guid` | |
| `TitleUz` | `string` | Uzbek title |
| `TitleRu` | `string` | Russian title |
| `TitleEn` | `string` | English title |
| `BodyUz` | `string` | Uzbek body |
| `BodyRu` | `string` | Russian body |
| `BodyEn` | `string` | English body |
| `Type` | `NotificationType` | Enum |
| `IsRead` | `bool` | |
| `ReadAt` | `DateTimeOffset?` | |
| `ActionUrl` | `string` | Deep link |
| `UserId` | `Guid` | |
| `CreatedDate` | `DateTimeOffset` | |
| `UpdatedDate` | `DateTimeOffset` | |
| `DeletedDate` | `DateTimeOffset?` | |

**Enum:** `NotificationType` → `BookingRequest`, `BookingApproved`, `BookingRejected`, `PaymentReceived`, `NewMessage`, `ReviewReceived`, `SystemAlert`

**Exceptions (10):** Standard pattern for `Notification`.

---

### 4.13 Announcement

**File:** `Models/Foundations/Announcements/Announcement.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Title` | `string` |
| `Content` | `string` |
| `Type` | `AnnouncementType` |
| `Target` | `AnnouncementTarget` |
| `IsActive` | `bool` |
| `PublishedAt` | `DateTimeOffset?` |
| `ExpiresAt` | `DateTimeOffset?` |
| `CreatedBy` | `Guid` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enums:**

| Enum | Values |
|---|---|
| `AnnouncementType` | `General`, `Maintenance`, `Promotion`, `PolicyUpdate` |
| `AnnouncementTarget` | `AllUsers`, `Hosts`, `Guests`, `Admins` |

**Exceptions (10):** Standard pattern for `Announcement`.

---

### 4.14 Discount

**File:** `Models/Foundations/Discounts/Discount.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Code` | `string` |
| `Description` | `string` |
| `Type` | `DiscountType` |
| `Target` | `DiscountTarget` |
| `Value` | `decimal` |
| `MaxDiscountAmount` | `decimal?` |
| `MaxUsageCount` | `int?` |
| `UsageCount` | `int` |
| `StartsAt` | `DateTimeOffset?` |
| `ExpiresAt` | `DateTimeOffset?` |
| `IsActive` | `bool` |
| `PropertyId` | `Guid?` |
| `UserId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Also:** `DiscountUsage.cs` in same folder

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `DiscountId` | `Guid` |
| `UserId` | `Guid` |
| `HomeRequestId` | `Guid?` |
| `AmountSaved` | `decimal` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enums:**

| Enum | Values |
|---|---|
| `DiscountType` | `Percentage`, `FixedAmount` |
| `DiscountTarget` | `AllProperties`, `SpecificProperty`, `SpecificUser`, `FirstBooking` |

**Exceptions (10):** Standard pattern for `Discount`.

---

### 4.15 AiRecommendation

**File:** `Models/Foundations/AIs/AiRecommendation.cs`

| Field | Type |
|---|---|
| `Id` | `Guid` |
| `Type` | `AiRecommendationType` |
| `Title` | `string` |
| `Description` | `string` |
| `Score` | `decimal` |
| `Metadata` | `string` |
| `IsActedUpon` | `bool` |
| `UserId` | `Guid` |
| `PropertyId` | `Guid?` |
| `CreatedDate` | `DateTimeOffset` |
| `UpdatedDate` | `DateTimeOffset` |
| `DeletedDate` | `DateTimeOffset?` |

**Enum:** `AiRecommendationType` → `PersonalizedListing`, `SimilarProperty`, `PriceOptimization`, `MarketInsight`

**Exceptions (10):** Standard pattern for `AiRecommendation`.

---

### Exception Hierarchy Summary

Each of the 15 models defines 10 exception classes (150 total), following the pattern:

```
Models/Foundations/<Entity>/Exceptions/
├── Null<Entity>Exception.cs           – entity reference was null
├── Invalid<Entity>Exception.cs        – entity fields failed validation
├── NotFound<Entity>Exception.cs       – entity not found in storage
├── AlreadyExists<Entity>Exception.cs  – duplicate entity
├── Failed<Entity>StorageException.cs  – storage-layer failure
├── Failed<Entity>ServiceException.cs  – service-layer failure
├── <Entity>ValidationException.cs     – wrapper for validation exceptions
├── <Entity>DependencyValidationException.cs – wrapper for dep-validation
├── <Entity>DependencyException.cs     – wrapper for dependency exceptions
└── <Entity>ServiceException.cs        – wrapper for service exceptions
```

All exception classes extend `Xeption` (from the `Xeption` NuGet package v2.8.0).

---

## 5. Services Detail

All services live in `Services/Foundations/<EntityPlural>/` and consist of 4 files per service:

```
IXxxService.cs           – interface
XxxService.cs            – constructor + method delegation
XxxService.Validations.cs – guard clauses and field validation
XxxService.Exceptions.cs – EF/storage exception mapping to domain exceptions
```

### Standard Interface (all 15 services share this shape)

```csharp
public interface IXxxService
{
    ValueTask<Xxx> AddXxxAsync(Xxx xxx);
    IQueryable<Xxx> RetrieveAllXxxs();
    ValueTask<Xxx> RetrieveXxxByIdAsync(Guid xxxId);
    ValueTask<Xxx> ModifyXxxAsync(Xxx xxx);
    ValueTask<Xxx> RemoveXxxByIdAsync(Guid xxxId);
}
```

### Constructor Dependencies (all services)

```csharp
public partial class XxxService : IXxxService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;
}
```

### Services List

| # | Interface | Implementation | Entity |
|---|---|---|---|
| 1 | `IUserService` | `UserService` | User |
| 2 | `IPropertyService` | `PropertyService` | Property |
| 3 | `IHomeRequestService` | `HomeRequestService` | HomeRequest |
| 4 | `IPaymentService` | `PaymentService` | Payment |
| 5 | `IReviewService` | `ReviewService` | Review |
| 6 | `IMessageService` | `MessageService` | Message |
| 7 | `INotificationService` | `NotificationService` | Notification |
| 8 | `IRentalContractService` | `RentalContractService` | RentalContract |
| 9 | `IFavoriteService` | `FavoriteService` | Favorite |
| 10 | `ISavedSearchService` | `SavedSearchService` | SavedSearch |
| 11 | `IPropertyImageService` | `PropertyImageService` | PropertyImage |
| 12 | `IPropertyViewService` | `PropertyViewService` | PropertyView |
| 13 | `IAiRecommendationService` | `AiRecommendationService` | AiRecommendation |
| 14 | `IDiscountService` | `DiscountService` | Discount |
| 15 | `IAnnouncementService` | `AnnouncementService` | Announcement |

### Validation Rules (example – `UserService.Validations.cs`)

- `ValidateUserOnAdd(User user)`: checks for null user, validates `Id != Guid.Empty`, `FirstName`/`LastName`/`Email`/`Phone`/`PasswordHash` are not empty, `CreatedDate` / `UpdatedDate` are recent (within tolerance), `CreatedDate == UpdatedDate` for new entities.
- `ValidateUserOnModify(User user)`: same field checks plus `UpdatedDate > CreatedDate`.
- Storage ID validation via `ValidateXxxId(Guid id)`.

### Exception Mapping (example – `UserService.Exceptions.cs`)

| Storage Exception | Domain Exception |
|---|---|
| `DbUpdateConcurrencyException` (no rows) | `NotFoundXxxException` → `XxxDependencyValidationException` |
| `DbUpdateException` (duplicate key) | `AlreadyExistsXxxException` → `XxxDependencyValidationException` |
| Other `DbUpdateException` | `FailedXxxStorageException` → `XxxDependencyException` |
| `SqlException` / other infrastructure | `FailedXxxStorageException` → `XxxDependencyException` |
| Any other `Exception` | `FailedXxxServiceException` → `XxxServiceException` |

All methods are wrapped with a `TryCatch` decorator pattern defined in the Exceptions partial.

---

## 6. Unit Tests

### Overview

| Metric | Value |
|---|---|
| Total test files | **121** (120 test classes + 1 .csproj) |
| Test project | `Mulkchi.Api.Tests.Unit` |
| Entities covered | All 15 foundation services |
| Files per service | 8 |

### File Structure per Service (×15 = 120 files)

```
Tests/Foundations/<EntityPlural>/
├── XxxServiceTests.cs                        # Base class: mocks, filler setup
├── XxxServiceTests.Logic.Add.cs              # Happy-path AddAsync logic
├── XxxServiceTests.Logic.Modify.cs           # Happy-path ModifyAsync logic
├── XxxServiceTests.Logic.Remove.cs           # Happy-path RemoveByIdAsync logic
├── XxxServiceTests.Logic.RetrieveById.cs     # Happy-path RetrieveByIdAsync logic
├── XxxServiceTests.Logic.RetrieveAll.cs      # Happy-path RetrieveAll logic
├── XxxServiceTests.Validations.Add.cs        # Validation failure tests for Add
└── XxxServiceTests.Exceptions.Add.cs         # Exception mapping tests for Add
```

### Services with Tests

All 15 services have tests:

| Folder | Service |
|---|---|
| `AiRecommendations/` | `AiRecommendationService` |
| `Announcements/` | `AnnouncementService` |
| `Discounts/` | `DiscountService` |
| `Favorites/` | `FavoriteService` |
| `HomeRequests/` | `HomeRequestService` |
| `Messages/` | `MessageService` |
| `Notifications/` | `NotificationService` |
| `Payments/` | `PaymentService` |
| `Properties/` | `PropertyService` |
| `PropertyImages/` | `PropertyImageService` |
| `PropertyViews/` | `PropertyViewService` |
| `RentalContracts/` | `RentalContractService` |
| `Reviews/` | `ReviewService` |
| `SavedSearches/` | `SavedSearchService` |
| `Users/` | `UserService` |

### Test Conventions

- **Pattern:** Given / When / Then (method name style)
- **Mocking:** `Moq` – mocks `IStorageBroker`, `ILoggingBroker`, `IDateTimeBroker`
- **Test data:** `Tynamix.ObjectFiller` with explicit `DateTimeOffset` seed setup
- **Assertions:** `FluentAssertions`
- **Framework:** `xUnit` 2.9.2
- **Partial classes:** one file per operation keeps each file focused

---

## 7. NuGet Packages

### Mulkchi.Api.csproj

| Package | Version | Purpose |
|---|---|---|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.0 | JWT bearer authentication |
| `Microsoft.AspNetCore.OpenApi` | 9.0.13 | OpenAPI / Swagger support |
| `Microsoft.EntityFrameworkCore.SqlServer` | 9.0.0 | SQL Server EF Core provider |
| `Microsoft.EntityFrameworkCore.Tools` | 9.0.0 | EF Core CLI / PMC tools (`PrivateAssets: all`) |
| `Swashbuckle.AspNetCore` | 7.2.0 | Swagger UI and OpenAPI generator |
| `Xeption` | 2.8.0 | Custom exception base class framework |

### Mulkchi.Api.Tests.Unit.csproj

| Package | Version | Purpose |
|---|---|---|
| `coverlet.collector` | 6.0.2 | Code coverage |
| `FluentAssertions` | 7.0.0 | Readable assertion DSL |
| `Microsoft.EntityFrameworkCore.InMemory` | 9.0.0 | In-memory EF provider for tests |
| `Microsoft.NET.Test.Sdk` | 17.12.0 | Test SDK and runner |
| `Moq` | 4.20.72 | Mocking framework |
| `Tynamix.ObjectFiller` | 1.5.9 | Random test-object generation |
| `xunit` | 2.9.2 | Test framework |
| `xunit.runner.visualstudio` | 2.8.2 | VS / rider test runner |

---

## 8. Architecture Summary

### Pattern: "The Standard"

The project follows **The Standard** by Hassan Habib — a layered, broker-based clean architecture for .NET:

```
Controllers
    │  (REST + SignalR)
    ▼
Foundation Services
    │  (business logic, validation, exception mapping)
    ▼
Brokers
    │  ├─ StorageBroker (DbContext partial classes)
    │  ├─ LoggingBroker (wraps ILogger)
    │  └─ DateTimeBroker (wraps DateTimeOffset.UtcNow)
    ▼
SQL Server Database
```

### Layer Descriptions

| Layer | Responsibility |
|---|---|
| **Controllers** | HTTP request/response, error-to-status-code translation, no business logic |
| **Foundation Services** | All domain logic, input validation, exception wrapping, audit timestamps |
| **StorageBroker** | Single EF Core `DbContext` split into 15 partial files; owns DB configuration |
| **LoggingBroker** | Thin adapter over `ILogger` to allow test substitution |
| **DateTimeBroker** | Thin adapter over `DateTimeOffset.UtcNow` to allow deterministic test time |

### SignalR Usage

- **Hub:** `ChatHub` at `/hub`
- **Real-time operations:** SendMessage, JoinPropertyRoom, LeavePropertyRoom, SendTypingIndicator, MarkAsRead, OnConnected/Disconnected
- **Registration:** `services.AddSignalR()` in `Startup.ConfigureServices`
- **Endpoint mapping:** `endpoints.MapHub<ChatHub>("/hub")` in `Startup.Configure`

### JWT Configuration

| Setting | Value |
|---|---|
| Default auth scheme | `JwtBearerDefaults.AuthenticationScheme` |
| Signing key | HS256 symmetric key from `JwtSettings:Secret` in appsettings |
| Valid issuer | `"Mulkchi"` |
| Valid audience | `"MulkchiUsers"` |
| Lifetime validation | Enabled |
| Clock skew | `TimeSpan.Zero` (zero tolerance) |
| Token expiry | 7 days (`ExpiryDays: 7` in appsettings) |

### CORS Configuration

| Setting | Value |
|---|---|
| Policy name | `"AllowAll"` |
| Origins | Any (`AllowAnyOrigin`) |
| Methods | Any (`AllowAnyMethod`) |
| Headers | Any (`AllowAnyHeader`) |
| Credentials | ❌ Not allowed (incompatible with `AllowAnyOrigin`) |

### Swagger Configuration

| Setting | Value |
|---|---|
| Title | `"Mulkchi API"` |
| Version | `v1` |
| Description | `"Mulkchi Real Estate Platform API"` |
| Security scheme | HTTP Bearer JWT |
| Header | `Authorization` |
| Bearer format | `JWT` |
| Available in | Development environment only |
| UI URL | `/swagger/index.html` |
| JSON URL | `/swagger/v1/swagger.json` |

---

## 9. What Is Missing / Potential Improvements

### Features Not Yet Implemented

1. **Authentication controller / token generation**  
   JWT is configured for validation but there is no `AuthController` (login, register, refresh-token endpoints). Currently anyone with a pre-issued token can call the API, but no endpoint exists to issue tokens.

2. **DiscountUsage DbSet / CRUD**  
   `DiscountUsage` entity exists in the Discounts model folder, but no `DbSet<DiscountUsage>` has been added to `StorageBroker`, and no service or controller exists for it.

3. **Database migrations**  
   No `Migrations/` folder exists. The project uses `EnsureCreated()` in Development, which is not suitable for production deployments. A proper migration strategy (EF Core Migrations or a schema management tool) should be introduced.

4. **Production CORS policy**  
   The `"AllowAll"` policy (`AllowAnyOrigin`) is unsuitable for production. A named, origin-specific policy should be added and selected based on environment.

5. **Soft-delete enforcement**  
   Models include `DeletedDate?` fields for soft deletion, but there is no global EF Core query filter (`HasQueryFilter`) to exclude soft-deleted rows automatically.

6. **File / media upload**  
   `PropertyImage.Url` stores a URL, but no file-upload endpoint or blob storage integration (e.g., Azure Blob, AWS S3) is present.

7. **Authorization policies / role-based guards**  
   `UserRole` enum defines `Guest`, `Host`, and `Admin`, but no `[Authorize(Roles = "Admin")]` or policy-based guards are applied to controllers or endpoints.

8. **Pagination and filtering**  
   All `GET /api/{resource}` endpoints return the full `IQueryable` result with no pagination, sorting, or filtering parameters.

9. **Email / SMS / push notification delivery**  
   `Notification` entities can be created, but no delivery mechanism (SMTP, Firebase, Telegram, etc.) is implemented.

10. **Payment gateway integration**  
    `PaymentMethod` enum references Uzbekistan gateways (`Payme`, `Click`, `Uzcard`, `Humo`), but no actual payment processing or webhook handler is present.

11. **AI / ML recommendation engine**  
    `AiRecommendation` entities can be stored but there is no actual ML model, scoring logic, or external AI service integration.

12. **SavedSearch notification matching**  
    `SavedSearch.NotifyOnMatch` flag exists but no background job or matcher is implemented to evaluate new listings against saved searches and trigger notifications.

13. **Multilingual Announcement support**  
    `Notification` has trilingual body/title fields, but `Announcement` has only single-language `Title` / `Content` fields — inconsistency to consider fixing.

14. **Integration / acceptance tests**  
    Only unit tests exist. No integration tests (using `WebApplicationFactory`) or acceptance/E2E tests cover the full request pipeline, middleware, or database.

15. **Health checks and observability**  
    No `AddHealthChecks()`, structured logging sink (e.g., Serilog, OpenTelemetry), or metrics endpoint is configured.

### Potential Improvements

| Area | Recommendation |
|---|---|
| Security | Replace `AllowAnyOrigin` CORS with explicit allowed origins in production |
| Security | Move JWT secret to environment variables / Azure Key Vault / secrets manager |
| Security | Add rate limiting (ASP.NET Core 7+ `RateLimiter` middleware) |
| Database | Add EF Core query filters for soft-delete (`IsDeleted` / `DeletedDate != null`) |
| Database | Introduce EF Core Migrations for schema version control |
| Database | Add database indexes on FK columns (`HostId`, `UserId`, `PropertyId`) |
| API design | Add pagination (`?page=1&size=20`) to all list endpoints |
| API design | Add `[Authorize]` and role/policy guards per controller action |
| Testing | Add `XxxService.Validations.Modify.cs` and `Exceptions.Modify.cs` test files |
| Testing | Add integration tests using `WebApplicationFactory<Program>` |
| DevOps | Add EF Core migration pipeline step in CI/CD |
| DevOps | Add code coverage reporting (coverlet is installed, just needs configuration) |
