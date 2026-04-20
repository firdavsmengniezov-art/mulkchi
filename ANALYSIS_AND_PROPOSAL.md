# Mulkchi: Smart Audit & Role Integration Analysis

## 1-QADAM: Analiz (Audit) Natijalari

### Backend Tahlili

#### User Model (Mulkchi.Api/Models/Foundations/Users/User.cs)
```csharp
public class User {
    public UserRole Role { get; set; }  // Single role: Guest, Host, Admin, etc.
    public HostBadge Badge { get; set; }
    public int TotalListings { get; set; }
    public int TotalBookings { get; set; }
    public DateTimeOffset? HostSince { get; set; }
    // ... other properties
}
```

**Holat**: User bir vaqtda faqat bitta rolga ega (Guest YOKI Host). Ko'p rollilik (Flags) yo'q.

#### AuthController (Mulkchi.Api/Controllers/AuthController.cs)
- `LoginAsync`: Foydalanuvchi rolini tekshirmaydi, faqat autentifikatsiya qiladi
- `RegisterAsync`: RegisterRequest orqali rolni qabul qiladi (default: Guest)
- **Yo'qolgan funksiya**: Rol almashtirish (switch) endpoint mavjud emas

#### RegisterRequest (Mulkchi.Api/Models/Foundations/Auth/RegisterRequest.cs)
```csharp
public UserRole Role { get; set; } = UserRole.Guest;  // Default Guest
```

**Holat**: Ro'yxatdan o'tishda rol tanlash majburiy emas (default Guest).

### Frontend Tahlili

#### AuthService (Mulkchi.Frontend/src/app/core/services/auth.service.ts)
```typescript
readonly userRole = computed(() => this._currentUser()?.role ?? null);

isHost(): boolean {
  const role = this._currentUser()?.role;
  return role === UserRole.Host || role === UserRole.Admin || role === UserRole.SuperAdmin;
}
```

**Holat**: 
- ✅ Rollarni tekshirish funksiyalari mavjud
- ❌ Rol almashtirish funksiyasi yo'q
- ❌ "Joriy rejim" (Current Mode) tushunchasi yo'q

#### Navbar (Mulkchi.Frontend/src/app/core/layout/navbar/navbar.component.ts)
```typescript
@if (isHost()) {
  <a mat-button routerLink="/host/properties">Mening mulklarim</a>
}
```

**Holat**: 
- Host roli bo'lsa, host menu ko'rinadi
- Guest/Host o'rtasida almashtirish imkoniyati yo'q
- "Single Identity" tizimi yo'q

#### Register Component (Mulkchi.Frontend/src/app/features/auth/register/register.component.ts)
```typescript
role: ['Guest' as UserRole, Validators.required]
```

**Holat**: Ro'yxatdan o'tishda rol tanlash Mavjud (Guest/Host), lekin keyin o'zgartirib bo'lmaydi.

### AI Price Trainer Tahlili

#### PriceRecommendationService (Mulkchi.Api/Services/Foundations/AI/PriceRecommendationService.cs)
```csharp
public async Task TrainModelAsync() {
    var properties = await GetTrainingDataAsync();
    var trainingData = ConvertToTrainingData(properties);
    var pipeline = BuildTrainingPipeline();
    model = pipeline.Fit(trainingData);
}
```

**Holat**: ✅ ML.NET model allaqachon mavjud va o'qitish funksiyasi bor. **PropertyPriceTrainer.cs yaratish shart emas**.

---

## 2-QADAM: Taklif (Proposal)

### Maqsad
**"Single Identity" tizimi**: Foydalanuvchi bitta hisob bilan kiradi va Navbar orqali Guest/Host rejimlari o'rtasida erkin almashadi.

### Mavjud vs Kerakli

| Komponent | Mavjud | Kerakli |
|-----------|--------|---------|
| User Model | Single role (Guest/Host) | Primary role + Current Mode |
| AuthController | Login/Register | + SwitchRole endpoint |
| AuthService | Role check | + BehaviorSubject for current mode |
| Navbar | Static role display | + "Switch to Host/Guest" button |
| Registration | Role selection required | Remove selection, default Guest |

### O'zgarishlar Ro'yxati

#### Backend O'zgarishlar:
1. **User.cs**: `CurrentMode` property qo'shish (Guest/Host)
2. **AuthController.cs**: `SwitchRole` endpoint qo'shish
3. **Login/Register**: CurrentMode ni response ga qo'shish

#### Frontend O'zgarishlar:
1. **User Model**: `currentMode` property qo'shish
2. **AuthService**: `currentMode$` BehaviorSubject yaratish
3. **Navbar**: Role switcher UI qo'shish
4. **Register**: Role selection olib tashlash (default Guest)

---

## 3-QADAM: Implementatsiya Rejasi

### Fayllar O'zgarishi:

```
Backend:
├── Models/Foundations/Users/
│   ├── User.cs                    [+ CurrentMode property]
│   └── UserRole.cs                [no change]
├── Controllers/
│   └── AuthController.cs          [+ SwitchRole endpoint]
└── Models/Foundations/Auth/
    └── AuthResponse.cs              [+ CurrentMode property]

Frontend:
├── src/app/core/models/
│   └── user.model.ts               [+ currentMode property]
├── src/app/core/services/
│   └── auth.service.ts             [+ BehaviorSubject for mode]
├── src/app/core/layout/navbar/
│   └── navbar.component.ts         [+ role switcher UI]
└── src/app/features/auth/register/
    └── register.component.ts       [- role selection]
```

### Xavfsizlik Tekshiruvlari:
- [ ] Faqat verified userlar Host rejimga o'ta olishi kerak
- [ ] Agar userda aktiv listinglar bo'lsa, Guest rejimga o'tish cheklanishi mumkin
- [ ] Admin har doim har ikki rejimga ham o'ta olishi kerak

---

## 4-QADAM: AI Price Trainer (Bonus)

**Status**: ✅ Allaqachon Mavjud

`PriceRecommendationService.cs` allaqachon ML.NET modelini o'qitish funksiyasiga ega:
- `TrainModelAsync()` - ML modelni o'qitish
- `PredictPriceAsync()` - Narxni bashorat qilish
- `GetRuleBasedPrediction()` - Agar ML model bo'lmasa, qoida asosida hisoblash

**Xulosa**: `PropertyPriceTrainer.cs` yaratish shart emas.

---

## Yig'indisi

**Bajariladigan ishlar:**
1. Backend: User modeliga CurrentMode qo'shish
2. Backend: SwitchRole endpoint yaratish
3. Frontend: AuthService ga mode management qo'shish
4. Frontend: Navbar ga role switcher qo'shish
5. Frontend: Register dan rol tanlashni olib tashlash

**Takroriy kod yo'qligi**: Mavjud kodni o'zgartirish orqali amalga oshiriladi, yangi duplicate yaratilmaydi.

**Keyingi bosqich**: Implementatsiya boshlash!
