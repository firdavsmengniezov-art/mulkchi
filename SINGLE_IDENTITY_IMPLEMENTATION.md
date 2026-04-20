# Mulkchi: Single Identity System Implementation

## 1. AUDIT NATIJALARI (Tekshirilgan)

### Mavjud Tizim Holati

| Komponent | Holat | Izoh |
|-----------|-------|------|
| **User Model** | Single role enum | Guest/Host/Admin - bir vaqtda bittasi |
| **AuthController** | Login/Register | Rol almashtirish endpoint yo'q |
| **AuthService** | `isHost()`, `isAdmin()` | Faqat rol tekshiruvi, rejim boshqaruvi yo'q |
| **Navbar** | Static role display | Guest/Host almashish imkoniyati yo'q |
| **Register** | Role selection required | Ro'yxatdan o'tishda majburiy tanlov |

### AI Price Trainer
**Status**: ✅ Allaqachon mavjud
- `PriceRecommendationService.cs` da `TrainModelAsync()` funksiyasi bor
- ML.NET model o'qitish va bashorat qilish ishlavoti tayyor
- **PropertyPriceTrainer.cs yaratish shart emas**

---

## 2. IMPLEMENTATSIYA (Yangi)

### Backend O'zgarishlari

#### 1. User.cs - CurrentMode qo'shildi
```csharp
public class User {
    public UserRole Role { get; set; }              // Asosiy rol (Guest/Host/Admin)
    public UserRole CurrentMode { get; set; }       // Joriy faol rejim
    public int TotalPropertiesListed { get; set; } // Host aktivligi
    public DateTimeOffset? ModeSwitchedAt { get; set; }
}
```

#### 2. AuthResponse.cs - CurrentMode qo'shildi
```csharp
public class AuthResponse {
    // ... existing properties
    public UserRole CurrentMode { get; set; }
}
```

#### 3. AuthUserInfo.cs - CurrentMode qo'shildi
```csharp
public class AuthUserInfo {
    // ... existing properties
    public UserRole CurrentMode { get; set; }
    
    public AuthUserInfo(AuthResponse response) {
        // ... existing assignments
        CurrentMode = response.CurrentMode;
    }
}
```

#### 4. SwitchRoleRequest.cs - Yangi yaratildi
```csharp
public class SwitchRoleRequest {
    public UserRole TargetMode { get; set; }  // Guest yoki Host
}
```

#### 5. UpdateProfileRequest.cs - CurrentMode qo'shildi
```csharp
public class UpdateProfileRequest {
    // ... existing properties
    public UserRole? CurrentMode { get; set; }
}
```

#### 6. AuthController.cs - SwitchRole endpoint qo'shildi
```csharp
[HttpPost("switch-role")]
[Authorize]
public async ValueTask<ActionResult<AuthUserInfo>> SwitchRoleAsync(SwitchRoleRequest request)
{
    // Validation: Faqat Guest yoki Host ga o'tish mumkin
    // Security: Host rejimga o'tish uchun tekshiruv (verified, emailConfirmed)
    // Update: CurrentMode va ModeSwitchedAt yangilanadi
    // Response: Yangi token bilan AuthUserInfo qaytariladi
}
```

### Frontend O'zgarishlari

#### 1. user.model.ts - Yangi interfeyslar
```typescript
export interface User {
    // ... existing properties
    currentMode?: UserRole;  // Joriy faol rejim
}

export interface AuthResponse {
    // ... existing properties
    currentMode?: UserRole;
}

export interface RegisterRequest {
    // ... existing properties
    role?: UserRole;  // Optional - defaults to Guest
}

export interface SwitchModeRequest {
    targetMode: UserRole.Guest | UserRole.Host;
}
```

#### 2. auth.service.ts - Single Identity Management
```typescript
export class AuthService {
    // BehaviorSubject for reactive mode switching
    private readonly _currentMode = new BehaviorSubject<UserRole>(UserRole.Guest);
    readonly currentMode$ = this._currentMode.asObservable();
    readonly currentMode = computed(() => ...);
    
    // Mode switching method
    switchMode(request: SwitchModeRequest): Observable<AuthResponse>
    
    // Helper methods
    isInHostMode(): boolean
    isInGuestMode(): boolean
}
```

#### 3. navbar.component.ts - Rejim almashtirish UI
```typescript
export class NavbarComponent {
    // Mode checking methods
    isInHostMode(): boolean
    isInGuestMode(): boolean
    canBeHost(): boolean  // Host bo'lish imkoniyati
    
    // Mode switching
    switchMode(mode: 'Guest' | 'Host'): void
}
```

**UI Yangiliklari:**
- User menu da "Rejim" bo'limi (Guest/Host tugmalar)
- Aktiv rejim ajratib ko'rsatiladi (active-mode CSS)
- Mobile sidenav da ham rejim almashtirish
- SnackBar xabarlar (rejim o'zgarganda)

#### 4. register.component.ts - Rol tanlash olib tashlandi
```typescript
// Before: role selection required
role: ['Guest' as UserRole, Validators.required]

// After: No role selection - defaults to Guest
// Single Identity: No role sent - defaults to Guest on backend
```

---

## 3. XAVFSIZLIK TEKSHIRUVLARI

### Host Rejimiga O'tish Shartlari
```csharp
bool canBecomeHost = 
    user.Role == UserRole.Host ||           // Asosiy rol Host
    user.Role == UserRole.Admin ||          // Admin
    user.Role == UserRole.SuperAdmin ||     // SuperAdmin
    user.Role == UserRole.Agent ||          // Agent
    (user.EmailConfirmed && user.IsVerified);  // Verified user
```

### Qoidalari:
1. Faqat `Guest` va `Host` rejimlar o'rtasida almashish mumkin
2. Host rejimga o'tish uchun foydalanuvchi tasdiqlangan bo'lishi kerak
3. Har bir rejim o'zgarishi `ModeSwitchedAt` da qayd etiladi
4. Yangi token qaytariladi (rejim JWT da saqlanadi)

---

## 4. FAYLLAR RO'YXATI

### Backend (Mulkchi.Api)
```
Models/Foundations/Users/
├── User.cs                          [MODIFIED: +CurrentMode, +TotalPropertiesListed, +ModeSwitchedAt]
└── UserRole.cs                      [NO CHANGE]

Models/Foundations/Auth/
├── AuthResponse.cs                  [MODIFIED: +CurrentMode]
├── AuthUserInfo.cs                  [MODIFIED: +CurrentMode, +Constructor]
├── SwitchRoleRequest.cs             [NEW: Switch mode request DTO]
└── UpdateProfileRequest.cs          [MODIFIED: +CurrentMode?]

Controllers/
└── AuthController.cs                [MODIFIED: +SwitchRole endpoint]
```

### Frontend (Mulkchi.Frontend)
```
src/app/core/models/
├── user.model.ts                    [MODIFIED: +currentMode, +SwitchModeRequest]
└── index.ts                         [NO CHANGE: exports from user.model]

src/app/core/services/
└── auth.service.ts                  [MODIFIED: +BehaviorSubject, +switchMode, +mode helpers]

src/app/core/layout/navbar/
└── navbar.component.ts              [MODIFIED: +Mode switcher UI, +CSS styles]

src/app/features/auth/register/
└── register.component.ts          [MODIFIED: -Role selection]
```

---

## 5. ISHLATISH

### Ishga Tushirish
```bash
# Backend
cd Mulkchi.Api
dotnet run --urls http://localhost:5000

# Frontend
cd Mulkchi.Frontend
npx ng serve --port 4200
```

### Foydalanish
1. **Ro'yxatdan o'tish**: Endi rol tanlash shart emas (default Guest)
2. **Kirish**: Bitta hisob bilan kirish
3. **Navbar**: Profil menyusi orqali Guest/Host o'rtasida almashish
4. **Xavfsizlik**: Host bo'lish uchun hisobni tasdiqlash kerak

---

## 6. TAKLIFLAR (Keyingi Qadamlar)

### Database Migration
```csharp
// CurrentMode uchun default qiymat
migrationBuilder.AddColumn<int>(
    name: "CurrentMode",
    table: "Users",
    nullable: false,
    defaultValue: 0);  // Guest
```

### Qo'shimcha Yaxshilashlar
1. **Host Onboarding**: Birinchi marta Host rejimga o'tganda qo'llanma ko'rsatish
2. **Mode History**: Rejim o'zgarishlari tarixini saqlash
3. **Notification**: Rejim o'zgarganda bildirishnoma yuborish
4. **Permissions**: Har bir rejim uchun alohida ruxsatlar

---

**Implementatsiya yakunlandi!** 🎉
