export enum PropertyType {
  Apartment = 'Apartment',
  House = 'House',
  Office = 'Office',
  Land = 'Land',
  Commercial = 'Commercial',
  Villa = 'Villa',
  Hotel = 'Hotel',
  Hostel = 'Hostel'
}

export enum PropertyCategory {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Agricultural = 'Agricultural'
}

export enum ListingType {
  Rent = 'Rent',
  Sale = 'Sale',
  DailyRent = 'DailyRent'
}

export enum PropertyStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Pending = 'Pending',
  Available = 'Available',
  Rented = 'Rented',
  Sold = 'Sold'
}

export enum UzbekistanRegion {
  ToshkentShahar = 'ToshkentShahar',
  ToshkentViloyat = 'ToshkentViloyat',
  Samarqand = 'Samarqand',
  Buxoro = 'Buxoro',
  Andijon = 'Andijon',
  Fargona = 'Fargona',
  Namangan = 'Namangan',
  Xorazm = 'Xorazm',
  Navoiy = 'Navoiy',
  Qashqadaryo = 'Qashqadaryo',
  Surxondaryo = 'Surxondaryo',
  Jizzax = 'Jizzax',
  Sirdaryo = 'Sirdaryo',
  Qoraqalpogiston = 'Qoraqalpogiston'
}

export enum Currency {
  UZS = 'UZS',
  USD = 'USD'
}

export interface Property {
  // Core
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category?: PropertyCategory;
  listingType: ListingType;
  status: PropertyStatus;

  // Pricing
  monthlyRent?: number;
  salePrice?: number;
  pricePerNight?: number;
  securityDeposit?: number;
  currency: Currency;
  exchangeRate: number;

  // Details
  area: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  maxGuests: number;

  // Location
  region: UzbekistanRegion | string;
  city: string;
  district?: string;
  address: string;
  mahalla?: string;
  latitude?: number;
  longitude?: number;
  distanceToCityCenter?: number;

  // Infrastructure (Uzbekistan-specific)
  hasMetroNearby: boolean;
  hasBusStop: boolean;
  hasMarketNearby: boolean;
  hasSchoolNearby: boolean;
  hasHospitalNearby: boolean;

  // Amenities - Basic
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  petsAllowed: boolean;

  // Amenities - Comfort
  hasElevator: boolean;
  hasSecurity: boolean;
  hasGenerator: boolean;
  hasGas: boolean;
  hasFurniture: boolean;
  isRenovated: boolean;

  // Amenities - International Standard
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWasher: boolean;
  hasKitchen: boolean;
  hasTV: boolean;
  hasWorkspace: boolean;
  isSelfCheckIn: boolean;
  isChildFriendly: boolean;
  isAccessible: boolean;

  // Booking & Status
  isInstantBook: boolean;
  isVacant: boolean;
  isFeatured: boolean;
  isVerified: boolean;

  // Stats
  averageRating: number;
  viewsCount: number;
  favoritesCount: number;
  reviewsCount?: number; // Backward compatibility

  // Relations
  hostId: string;
  ownerId: string; // Backward compatibility alias for hostId
  images?: PropertyImage[];

  // Status
  isActive: boolean; // Backward compatibility

  // Metadata
  createdDate: string;
  updatedDate: string;
}

export interface PropertyResponse extends Property {}

export interface PropertyImage {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  imageUrl?: string;
  isMain?: boolean;
  isPrimary?: boolean;
}

export interface PropertySearchParams {
  region?: string;
  city?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  listingType?: string;
  propertyType?: string;
  propertyTypes?: string[];
  hasMetroNearby?: boolean;
  hasMarketNearby?: boolean;
  hasSchoolNearby?: boolean;
  hasHospitalNearby?: boolean;
  sortBy?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

export interface PropertyQueryParams extends PropertySearchParams {}
