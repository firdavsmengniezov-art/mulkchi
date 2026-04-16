export enum PropertyType {
  Apartment = 'Apartment',
  House = 'House',
  Office = 'Office',
  Land = 'Land',
  Commercial = 'Commercial',
}
export enum ListingType {
  Rent = 'Rent',
  Sale = 'Sale',
  DailyRent = 'DailyRent',
}
export enum PropertyStatus {
  Available = 'Available',
  Rented = 'Rented',
  Sold = 'Sold',
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category?: string;
  listingType: ListingType;
  status: PropertyStatus;
  monthlyRent?: number;
  salePrice?: number;
  pricePerNight?: number;
  area: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  maxGuests?: number;
  region: string;
  city: string;
  address: string;
  isActive: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  longitude?: number;
  latitude?: number;
  ownerId: string;
  images?: PropertyImage[];
  isInstantBook?: boolean;
  viewsCount?: number;
  isRenovated?: boolean;
  averageRating?: number;
  reviewsCount?: number;
}

export interface PropertyResponse extends Property {}

export interface PropertyImage {
  id: string;
  url: string;
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
