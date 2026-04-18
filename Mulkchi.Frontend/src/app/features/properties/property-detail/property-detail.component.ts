import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property, ListingType, UserRole } from '../../../core/models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="property-detail-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Yuklanmoqda...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <h2>{{ error() }}</h2>
          <button mat-raised-button color="primary" routerLink="/properties">
            Barcha mulklarga qaytish
          </button>
        </div>
      } @else if (property()) {
        <div class="property-content">
          <!-- Image Gallery -->
          <div class="gallery-section">
            <div class="main-image">
              @if (currentImage()) {
                <img [src]="currentImage()" [alt]="property()?.title">
              } @else {
                <div class="no-image">
                  <mat-icon>image_not_supported</mat-icon>
                </div>
              }
              
              @if (property()?.images && property()!.images!.length > 1) {
                <button mat-icon-button class="nav-btn prev" (click)="prevImage()">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <button mat-icon-button class="nav-btn next" (click)="nextImage()">
                  <mat-icon>chevron_right</mat-icon>
                </button>
                <div class="image-counter">
                  {{ currentImageIndex() + 1 }} / {{ property()!.images!.length }}
                </div>
              }
            </div>
            
            @if (property()?.images && property()!.images!.length > 1) {
              <div class="thumbnail-list">
                @for (image of property()!.images; track image.id; let i = $index) {
                  <div 
                    class="thumbnail" 
                    [class.active]="i === currentImageIndex()"
                    (click)="selectImage(i)">
                    <img [src]="image.imageUrl" [alt]="image.caption || ''">
                  </div>
                }
              </div>
            }
          </div>

          <!-- Property Info -->
          <div class="info-section">
            <div class="info-header">
              <div class="badges">
                @if (property()?.isFeatured) {
                  <span class="badge featured">Featured</span>
                }
                @if (property()?.isVerified) {
                  <span class="badge verified">
                    <mat-icon>verified</mat-icon> Tasdiqlangan
                  </span>
                }
                @if (property()?.isInstantBook) {
                  <span class="badge instant">Tez bron</span>
                }
              </div>
              
              <h1>{{ property()?.title }}</h1>
              
              <div class="location">
                <mat-icon>location_on</mat-icon>
                <span>{{ property()?.address }}, {{ property()?.district }}, {{ property()?.city }}</span>
              </div>
              
              <div class="rating-price">
                <div class="rating" *ngIf="property()?.averageRating">
                  <mat-icon>star</mat-icon>
                  <span>{{ property()?.averageRating | number:'1.1-1' }}</span>
                  <span class="reviews">({{ property()?.viewsCount }} ko'rish)</span>
                </div>
                
                <div class="price">
                  @if (property()?.listingType === ListingType.Sale && property()?.salePrice) {
                    <span class="amount">{{ property()?.salePrice | number }} {{ property()?.currency }}</span>
                    <span class="type">Sotuv</span>
                  } @else if (property()?.listingType === ListingType.Rent && property()?.monthlyRent) {
                    <span class="amount">{{ property()?.monthlyRent | number }} {{ property()?.currency }}</span>
                    <span class="type">/oy</span>
                  } @else if (property()?.listingType === ListingType.ShortTermRent && property()?.pricePerNight) {
                    <span class="amount">{{ property()?.pricePerNight | number }} {{ property()?.currency }}</span>
                    <span class="type">/tun</span>
                  }
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="stat">
                <mat-icon>bed</mat-icon>
                <div>
                  <span class="value">{{ property()?.numberOfBedrooms }}</span>
                  <span class="label">Xona</span>
                </div>
              </div>
              <div class="stat">
                <mat-icon>bathtub</mat-icon>
                <div>
                  <span class="value">{{ property()?.numberOfBathrooms }}</span>
                  <span class="label">Hammom</span>
                </div>
              </div>
              <div class="stat">
                <mat-icon>square_foot</mat-icon>
                <div>
                  <span class="value">{{ property()?.area }}</span>
                  <span class="label">m²</span>
                </div>
              </div>
              <div class="stat">
                <mat-icon>people</mat-icon>
                <div>
                  <span class="value">{{ property()?.maxGuests }}</span>
                  <span class="label">Mehmon</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Description -->
            <div class="description-section">
              <h2>Tavsif</h2>
              <p>{{ property()?.description }}</p>
            </div>

            <!-- Amenities -->
            <div class="amenities-section">
              <h2>Qulayliklar</h2>
              <div class="amenities-grid">
                @for (amenity of amenitiesList(); track amenity.name) {
                  <div class="amenity-item" [class.available]="amenity.available">
                    <mat-icon [class.active]="amenity.available">
                      {{ amenity.available ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                    <span>{{ amenity.label }}</span>
                  </div>
                }
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Location Info -->
            <div class="location-section">
              <h2>Joylashuv</h2>
              <div class="location-details">
                <p><strong>Viloyat:</strong> {{ property()?.region }}</p>
                <p><strong>Shahar:</strong> {{ property()?.city }}</p>
                <p><strong>Tuman:</strong> {{ property()?.district }}</p>
                <p><strong>Mahalla:</strong> {{ property()?.mahalla }}</p>
                <p><strong>Manzil:</strong> {{ property()?.address }}</p>
                @if (property()?.distanceToCityCenter) {
                  <p><strong>Shahar markazigacha:</strong> {{ property()?.distanceToCityCenter }} km</p>
                }
              </div>
            </div>

            <!-- Host Info -->
            <mat-card class="host-card">
              <mat-card-header>
                <mat-card-title>Host haqida</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="host-info">
                  <div class="host-avatar">
                    <mat-icon>account_circle</mat-icon>
                  </div>
                  <div class="host-details">
                    <h4>Host ID: {{ property()?.hostId | slice:0:8 }}...</h4>
                    <p>Tasdiqlangan host</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Actions -->
            <div class="actions-section">
              @if (isAuthenticated()) {
                @if (!isOwner()) {
                  <button mat-raised-button color="primary" class="action-btn" (click)="bookNow()">
                    <mat-icon>calendar_today</mat-icon>
                    Bron qilish
                  </button>
                  <button mat-stroked-button color="primary" class="action-btn" (click)="contactHost()">
                    <mat-icon>message</mat-icon>
                    Host bilan bog'lanish
                  </button>
                  <button 
                    mat-icon-button 
                    [color]="isFavorite() ? 'warn' : ''" 
                    (click)="toggleFavorite()"
                    [matTooltip]="isFavorite() ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'">
                    <mat-icon>{{ isFavorite() ? 'favorite' : 'favorite_border' }}</mat-icon>
                  </button>
                } @else {
                  <div class="owner-actions">
                    <button mat-raised-button color="primary" [routerLink]="['/host/properties/edit', property()?.id]">
                      <mat-icon>edit</mat-icon>
                      Tahrirlash
                    </button>
                    <button mat-stroked-button color="warn" (click)="deleteProperty()">
                      <mat-icon>delete</mat-icon>
                      O'chirish
                    </button>
                  </div>
                }
              } @else {
                <div class="auth-prompt">
                  <p>Bron qilish yoki aloqa uchun tizimga kiring</p>
                  <button mat-raised-button color="primary" routerLink="/auth/login">
                    Kirish
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .property-detail-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 16px;
    }

    .error-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }

    .property-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 32px;
    }

    /* Gallery Section */
    .gallery-section {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .main-image {
      position: relative;
      height: 500px;
      background: #f0f0f0;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .no-image mat-icon {
      font-size: 80px;
      color: #ccc;
    }

    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.9) !important;
    }

    .nav-btn.prev { left: 16px; }
    .nav-btn.next { right: 16px; }

    .image-counter {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .thumbnail-list {
      display: flex;
      gap: 8px;
      padding: 16px;
      overflow-x: auto;
    }

    .thumbnail {
      width: 100px;
      height: 70px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
      flex-shrink: 0;
    }

    .thumbnail.active {
      border-color: #667eea;
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Info Section */
    .info-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: fit-content;
    }

    .info-header {
      margin-bottom: 24px;
    }

    .badges {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .badge.featured {
      background: #ff6b6b;
      color: white;
    }

    .badge.verified {
      background: #e8f5e9;
      color: #4caf50;
    }

    .badge.instant {
      background: #e3f2fd;
      color: #2196f3;
    }

    .badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .info-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      margin-bottom: 16px;
    }

    .location mat-icon {
      color: #667eea;
    }

    .rating-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffa500;
    }

    .rating .reviews {
      color: #666;
      font-size: 0.9rem;
    }

    .price {
      text-align: right;
    }

    .price .amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: #667eea;
      display: block;
    }

    .price .type {
      color: #666;
      font-size: 0.9rem;
    }

    mat-divider {
      margin: 24px 0;
    }

    /* Quick Stats */
    .quick-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 8px 0;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stat mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #667eea;
    }

    .stat .value {
      display: block;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .stat .label {
      font-size: 0.8rem;
      color: #666;
    }

    /* Description */
    .description-section h2,
    .amenities-section h2,
    .location-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }

    .description-section p {
      color: #555;
      line-height: 1.7;
      white-space: pre-line;
    }

    /* Amenities */
    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .amenity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 8px;
      color: #999;
    }

    .amenity-item.available {
      color: #333;
      background: #f5f5f5;
    }

    .amenity-item mat-icon {
      font-size: 20px;
    }

    .amenity-item mat-icon.active {
      color: #4caf50;
    }

    /* Location Details */
    .location-details p {
      margin-bottom: 8px;
      color: #555;
    }

    /* Host Card */
    .host-card {
      margin-top: 24px;
      background: #f8f9fa;
    }

    .host-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .host-avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
    }

    .host-details h4 {
      margin: 0 0 4px 0;
      font-weight: 600;
    }

    .host-details p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    /* Actions */
    .actions-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-btn {
      flex: 1;
      min-width: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .owner-actions {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    .auth-prompt {
      width: 100%;
      text-align: center;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .auth-prompt p {
      margin-bottom: 12px;
      color: #666;
    }

    @media (max-width: 1024px) {
      .property-content {
        grid-template-columns: 1fr;
      }

      .main-image {
        height: 350px;
      }

      .quick-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .property-content {
        padding: 16px;
      }

      .info-header h1 {
        font-size: 1.25rem;
      }

      .price .amount {
        font-size: 1.25rem;
      }

      .amenities-grid {
        grid-template-columns: 1fr;
      }

      .actions-section {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
      }
    }
  `]
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  property = this.propertyService.currentProperty;
  loading = this.propertyService.loading;
  error = signal<string | null>(null);
  currentImageIndex = signal(0);
  isFavorite = signal(false);

  currentImage = computed(() => {
    const prop = this.property();
    if (prop?.images && prop.images.length > 0) {
      return prop.images[this.currentImageIndex()].imageUrl;
    }
    return null;
  });

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  isOwner = computed(() => {
    const user = this.currentUser();
    const prop = this.property();
    return user && prop && user.id === prop.hostId;
  });

  ListingType = ListingType;

  amenitiesList = computed(() => {
    const prop = this.property();
    if (!prop) return [];

    return [
      { name: 'wifi', label: 'Wi-Fi', available: prop.hasWifi },
      { name: 'parking', label: 'Avtoturargoh', available: prop.hasParking },
      { name: 'pool', label: 'Hovuz', available: prop.hasPool },
      { name: 'ac', label: 'Konditsioner', available: prop.hasAirConditioning },
      { name: 'heating', label: 'Isitish', available: prop.hasHeating },
      { name: 'kitchen', label: 'Oshxona', available: prop.hasKitchen },
      { name: 'tv', label: 'TV', available: prop.hasTV },
      { name: 'washer', label: 'Kir yuvish', available: prop.hasWasher },
      { name: 'workspace', label: 'Ish joyi', available: prop.hasWorkspace },
      { name: 'elevator', label: 'Lift', available: prop.hasElevator },
      { name: 'security', label: 'Qo\'riqlash', available: prop.hasSecurity },
      { name: 'generator', label: 'Generator', available: prop.hasGenerator },
      { name: 'furniture', label: 'Mebel', available: prop.hasFurniture },
      { name: 'renovated', label: 'Tamirlangan', available: prop.isRenovated },
      { name: 'pets', label: 'Uy hayvonlari', available: prop.petsAllowed },
      { name: 'metro', label: 'Metro yaqinida', available: prop.hasMetroNearby },
      { name: 'market', label: 'Bozor yaqinida', available: prop.hasMarketNearby },
      { name: 'school', label: 'Maktab yaqinida', available: prop.hasSchoolNearby },
      { name: 'hospital', label: 'Shifoxona yaqinida', available: prop.hasHospitalNearby }
    ];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(id);
    } else {
      this.error.set('Mulk ID topilmadi');
    }
  }

  loadProperty(id: string): void {
    this.error.set(null);
    
    this.propertyService.getPropertyById(id).subscribe({
      error: (err) => {
        this.error.set('Mulk ma\'lumotlarini yuklashda xatolik yuz berdi');
        console.error('Error loading property:', err);
      }
    });
  }

  selectImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  prevImage(): void {
    this.currentImageIndex.update(i => {
      const prop = this.property();
      if (!prop?.images) return 0;
      return i === 0 ? prop.images.length - 1 : i - 1;
    });
  }

  nextImage(): void {
    this.currentImageIndex.update(i => {
      const prop = this.property();
      if (!prop?.images) return 0;
      return i === prop.images.length - 1 ? 0 : i + 1;
    });
  }

  bookNow(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    
    this.snackBar.open('Bron qilish funksiyasi tez orada qo\'shiladi', 'Yopish', {
      duration: 3000
    });
  }

  contactHost(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    
    this.snackBar.open('Xabar yuborish funksiyasi tez orada qo\'shiladi', 'Yopish', {
      duration: 3000
    });
  }

  toggleFavorite(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isFavorite.update(v => !v);
    
    this.snackBar.open(
      this.isFavorite() ? 'Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi',
      'Yopish',
      { duration: 2000 }
    );
  }

  deleteProperty(): void {
    const prop = this.property();
    if (!prop) return;

    if (confirm('Haqiqatan ham bu mulkni o\'chirmoqchimisiz?')) {
      this.propertyService.deleteProperty(prop.id).subscribe({
        next: () => {
          this.snackBar.open('Mulk o\'chirildi', 'Yopish', { duration: 3000 });
          this.router.navigate(['/properties']);
        },
        error: () => {
          this.snackBar.open('O\'chirishda xatolik yuz berdi', 'Yopish', { duration: 3000 });
        }
      });
    }
  }
}
