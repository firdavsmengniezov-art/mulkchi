import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

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
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  stats = {
    totalListings: 15432,
    cities: 45,
    users: 89345
  };

  featuredProperties: Property[] = [
    {
      id: 1,
      title: 'Zamonaviy 3 xonali kvartira',
      address: 'Amir Temur ko\'chasi, 45',
      city: 'Toshkent',
      price: 85000,
      priceCurrency: 'USD',
      listingType: 'Sale',
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      area: 120,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      isFeatured: true,
      averageRating: 4.8,
      reviewsCount: 24
    },
    {
      id: 2,
      title: 'Prezident bog\'ida uy',
      address: 'Shota Rustaveli ko\'chasi, 12',
      city: 'Toshkent',
      price: 450000,
      priceCurrency: 'USD',
      listingType: 'Sale',
      numberOfBedrooms: 5,
      numberOfBathrooms: 4,
      area: 450,
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      isFeatured: true,
      averageRating: 4.9,
      reviewsCount: 18
    },
    {
      id: 3,
      title: 'Ofis binosi markazda',
      address: 'Afrosiyob ko\'chasi, 8',
      city: 'Samarqand',
      price: 1200,
      priceCurrency: 'USD',
      listingType: 'Rent',
      numberOfBedrooms: 0,
      numberOfBathrooms: 2,
      area: 200,
      images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
      isFeatured: false,
      isInstantBook: true,
      averageRating: 4.7,
      reviewsCount: 12
    },
    {
      id: 4,
      title: 'Qishloq uyi manzarali',
      address: 'Bog\'ishamol MFY',
      city: 'Buxoro',
      price: 45000,
      priceCurrency: 'USD',
      listingType: 'Sale',
      numberOfBedrooms: 4,
      numberOfBathrooms: 2,
      area: 180,
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      isFeatured: true,
      averageRating: 4.6,
      reviewsCount: 8
    },
    {
      id: 5,
      title: '2 xonali kvartira ijaraga',
      address: 'Mustaqillik shoh ko\'chasi, 102',
      city: 'Toshkent',
      price: 600,
      priceCurrency: 'USD',
      listingType: 'Rent',
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      area: 75,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      isFeatured: false,
      averageRating: 4.5,
      reviewsCount: 15
    },
    {
      id: 6,
      title: 'Yangi qurilgan turar joy',
      address: 'Chilonzor 15-kvartal',
      city: 'Toshkent',
      price: 72000,
      priceCurrency: 'USD',
      listingType: 'Sale',
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      area: 68,
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
      isFeatured: true,
      averageRating: 4.8,
      reviewsCount: 32
    }
  ];

  ngOnInit(): void {
    // Animate stats on load
    this.animateStats();
  }

  onSearch(params: SearchParams): void {
    console.log('Search params:', params);
    // Navigate to listings with search params
  }

  private animateStats(): void {
    // Stats animation logic could go here
  }

  formatNumber(num: number): string {
    return num.toLocaleString('uz-UZ');
  }
}

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  price: number;
  priceCurrency: string;
  listingType: 'Sale' | 'Rent' | 'DailyRent';
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  area: number;
  images: string[];
  isFeatured?: boolean;
  isInstantBook?: boolean;
  averageRating?: number;
  reviewsCount?: number;
}

interface SearchParams {
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
}
