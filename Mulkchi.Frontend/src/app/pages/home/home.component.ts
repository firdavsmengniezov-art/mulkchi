import { Component, OnInit, ChangeDetectionStrategy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { Property, PropertyType, ListingType, PropertyStatus } from '../../core/models/property.model';
import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    SearchBarComponent,
    PropertyCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        query('.animate-item', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('countUp', [
      transition(':enter', [
        animate('2000ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  
  // Signals for reactive state
  readonly isLoading = signal(true);
  readonly activeTab = signal<'sale' | 'rent'>('sale');
  readonly hoveredProperty = signal<string | null>(null);
  
  // Animated stats with signals
  readonly stats = signal({
    totalListings: 0,
    cities: 0,
    users: 0
  });
  
  // Target stats for animation
  private readonly targetStats = {
    totalListings: 15432,
    cities: 45,
    users: 89345
  };

  featuredProperties: Property[] = [
    {
      id: '1',
      title: 'Zamonaviy 3 xonali kvartira',
      description: 'Zamonaviy 3 xonali kvartira markazda',
      address: 'Amir Temur ko\'chasi, 45',
      city: 'Toshkent',
      region: 'Toshkent',
      type: PropertyType.Apartment,
      listingType: ListingType.Sale,
      status: PropertyStatus.Available,
      area: 120,
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      salePrice: 85000,
      isActive: true,
      ownerId: '1',
      hostId: '1',
      images: [{ id: '1', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', isMain: true }],
      isFeatured: true,
      isVerified: true,
      averageRating: 4.8,
      reviewsCount: 24,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      // Add missing required fields with default values
      currency: 'UZS' as any,
      exchangeRate: 1,
      maxGuests: 6,
      hasMetroNearby: true,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      hasWifi: true,
      hasParking: true,
      hasPool: false,
      petsAllowed: false,
      hasElevator: true,
      hasSecurity: true,
      hasGenerator: false,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: true,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: false,
      isSelfCheckIn: false,
      isChildFriendly: true,
      isAccessible: false,
      isInstantBook: false,
      isVacant: true,
      favoritesCount: 0,
      viewsCount: 120
    } as Property,
    {
      id: '2',
      title: 'Prezident bog\'ida uy',
      description: 'Prezident bog\'ida 5 xonali uy',
      address: 'Shota Rustaveli ko\'chasi, 12',
      city: 'Toshkent',
      region: 'Toshkent',
      type: PropertyType.House,
      listingType: ListingType.Sale,
      status: PropertyStatus.Available,
      area: 450,
      numberOfBedrooms: 5,
      numberOfBathrooms: 4,
      salePrice: 450000,
      isActive: true,
      ownerId: '2',
      hostId: '2',
      images: [{ id: '2', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', isMain: true }],
      isFeatured: true,
      isVerified: true,
      averageRating: 4.9,
      reviewsCount: 18,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      currency: 'UZS' as any,
      exchangeRate: 1,
      maxGuests: 10,
      hasMetroNearby: false,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: true,
      hasHospitalNearby: false,
      hasWifi: true,
      hasParking: true,
      hasPool: true,
      petsAllowed: true,
      hasElevator: false,
      hasSecurity: true,
      hasGenerator: true,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: true,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: true,
      isSelfCheckIn: true,
      isChildFriendly: true,
      isAccessible: true,
      isInstantBook: true,
      isVacant: true,
      favoritesCount: 15,
      viewsCount: 200
    } as Property,
    {
      id: '3',
      title: 'Ofis binosi markazda',
      description: 'Ofis binosi markazda',
      address: 'Afrosiyob ko\'chasi, 8',
      city: 'Samarqand',
      region: 'Samarqand',
      type: PropertyType.Commercial,
      listingType: ListingType.Rent,
      status: PropertyStatus.Available,
      area: 200,
      numberOfBedrooms: 0,
      numberOfBathrooms: 2,
      monthlyRent: 1200,
      isActive: true,
      ownerId: '3',
      hostId: '3',
      images: [{ id: '3', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', isMain: true }],
      isFeatured: false,
      isVerified: true,
      isInstantBook: true,
      averageRating: 4.7,
      reviewsCount: 12,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      currency: 'UZS' as any,
      exchangeRate: 1,
      maxGuests: 20,
      hasMetroNearby: false,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      hasWifi: true,
      hasParking: true,
      hasPool: false,
      petsAllowed: false,
      hasElevator: true,
      hasSecurity: true,
      hasGenerator: true,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: false,
      hasKitchen: false,
      hasTV: false,
      hasWorkspace: true,
      isSelfCheckIn: false,
      isChildFriendly: false,
      isAccessible: true,
      isVacant: true,
      favoritesCount: 5,
      viewsCount: 80
    } as Property,
    {
      id: '4',
      title: 'Qishloq uyi manzarali',
      description: 'Qishloq uyi manzarali joyda',
      address: 'Bog\'ishamol MFY',
      city: 'Buxoro',
      region: 'Buxoro',
      type: PropertyType.House,
      listingType: ListingType.Sale,
      status: PropertyStatus.Available,
      area: 180,
      numberOfBedrooms: 4,
      numberOfBathrooms: 2,
      salePrice: 45000,
      isActive: true,
      ownerId: '4',
      hostId: '4',
      images: [{ id: '4', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', isMain: true }],
      isFeatured: true,
      isVerified: false,
      averageRating: 4.6,
      reviewsCount: 8,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      currency: 'UZS' as any,
      exchangeRate: 1,
      maxGuests: 8,
      hasMetroNearby: false,
      hasBusStop: false,
      hasMarketNearby: true,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      hasWifi: false,
      hasParking: true,
      hasPool: false,
      petsAllowed: true,
      hasElevator: false,
      hasSecurity: false,
      hasGenerator: false,
      hasGas: true,
      hasFurniture: false,
      isRenovated: false,
      hasAirConditioning: false,
      hasHeating: false,
      hasWasher: false,
      hasKitchen: true,
      hasTV: false,
      hasWorkspace: false,
      isSelfCheckIn: true,
      isChildFriendly: true,
      isAccessible: false,
      isInstantBook: false,
      isVacant: true,
      favoritesCount: 2,
      viewsCount: 45
    } as Property,
    {
      id: '5',
      title: '2 xonali kvartira ijaraga',
      description: '2 xonali kvartira ijaraga',
      address: 'Mustaqillik shoh ko\'chasi, 102',
      city: 'Toshkent',
      region: 'Toshkent',
      type: PropertyType.Apartment,
      listingType: ListingType.Rent,
      status: PropertyStatus.Available,
      area: 75,
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      monthlyRent: 600,
      isActive: true,
      ownerId: '5',
      hostId: '5',
      images: [{ id: '5', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isMain: true }],
      isFeatured: false,
      isVerified: true,
      averageRating: 4.5,
      reviewsCount: 15,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      currency: 'UZS' as any,
      exchangeRate: 1,
      maxGuests: 4,
      hasMetroNearby: true,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: true,
      hasHospitalNearby: false,
      hasWifi: true,
      hasParking: false,
      hasPool: false,
      petsAllowed: false,
      hasElevator: false,
      hasSecurity: false,
      hasGenerator: false,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: true,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: false,
      isSelfCheckIn: false,
      isChildFriendly: true,
      isAccessible: false,
      isInstantBook: false,
      isVacant: true,
      favoritesCount: 8,
      viewsCount: 95
    } as Property,
    {
      id: '6',
      title: 'Yangi qurilgan turar joy',
      description: 'Yangi qurilgan turar joy',
      address: 'Chilonzor 15-kvartal',
      city: 'Toshkent',
      region: 'Toshkent',
      type: PropertyType.Apartment,
      listingType: ListingType.Sale,
      status: PropertyStatus.Available,
      area: 68,
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      salePrice: 72000,
      isActive: true,
      ownerId: '6',
      hostId: '6',
      images: [{ id: '6', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', isMain: true }],
      isFeatured: true,
      isVerified: true,
      averageRating: 4.8,
      reviewsCount: 32,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      currency: 'UZS' as any,
      exchangeRate: 1,
      maxGuests: 4,
      hasMetroNearby: true,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: true,
      hasHospitalNearby: false,
      hasWifi: true,
      hasParking: true,
      hasPool: false,
      petsAllowed: false,
      hasElevator: true,
      hasSecurity: true,
      hasGenerator: false,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: true,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: false,
      isSelfCheckIn: false,
      isChildFriendly: true,
      isAccessible: false,
      isInstantBook: false,
      isVacant: true,
      favoritesCount: 20,
      viewsCount: 180
    } as Property
  ];

  // Filtered properties based on active tab
  readonly filteredProperties = computed(() => {
    const tab = this.activeTab();
    return this.featuredProperties.filter(p => 
      tab === 'sale' ? p.listingType === ListingType.Sale : p.listingType === ListingType.Rent
    );
  });

  ngOnInit(): void {
    // Simulate loading and animate stats
    setTimeout(() => {
      this.isLoading.set(false);
      this.animateStats();
    }, 800);
  }

  onSearch(params: SearchParams): void {
    // Navigate to properties with search query params
    const queryParams: any = {};
    if (params.location) queryParams.city = params.location;
    if (params.propertyType) queryParams.type = params.propertyType;
    if (params.minPrice) queryParams.minPrice = params.minPrice;
    if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
    
    this.router.navigate(['/properties'], { queryParams });
  }

  setActiveTab(tab: 'sale' | 'rent'): void {
    this.activeTab.set(tab);
  }

  onPropertyHover(id: string | null): void {
    this.hoveredProperty.set(id);
  }

  private animateStats(): void {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      this.stats.set({
        totalListings: Math.floor(this.targetStats.totalListings * easeOut),
        cities: Math.floor(this.targetStats.cities * easeOut),
        users: Math.floor(this.targetStats.users * easeOut)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        this.stats.set(this.targetStats);
      }
    }, interval);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('uz-UZ');
  }

  scrollToProperties(): void {
    const element = document.querySelector('.featured-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}

interface SearchParams {
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
}
