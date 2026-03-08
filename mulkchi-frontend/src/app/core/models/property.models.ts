export type ListingType = 'Rent' | 'Sale' | 'ShortTermRent';
export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Room' | 'Office' | 'Land' | 'Commercial';
export type PropertyStatus = 'Active' | 'Inactive' | 'Pending' | 'Rejected' | 'Deleted';
export type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
export type UzbekistanRegion =
  | 'ToshkentShahar' | 'ToshkentViloyat' | 'Samarqand' | 'Buxoro'
  | 'Andijon' | 'Fargona' | 'Namangan' | 'Qashqadaryo'
  | 'Surxondaryo' | 'Xorazm' | 'Navoiy' | 'Jizzax'
  | 'Sirdaryo' | 'Qoraqalpogiston';

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  status: PropertyStatus;
  listingType: ListingType;
  monthlyRent?: number;
  salePrice?: number;
  pricePerNight?: number;
  securityDeposit?: number;
  area: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  maxGuests: number;
  region: UzbekistanRegion;
  city: string;
  district: string;
  address: string;
  mahalla?: string;
  latitude?: number;
  longitude?: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  petsAllowed: boolean;
  isInstantBook: boolean;
  isVacant: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  hasMetroNearby: boolean;
  hasBusStop: boolean;
  hasMarketNearby: boolean;
  hasSchoolNearby: boolean;
  hasHospitalNearby: boolean;
  distanceToCityCenter: number;
  hasElevator: boolean;
  hasSecurity: boolean;
  hasGenerator: boolean;
  hasGas: boolean;
  hasFurniture: boolean;
  isRenovated: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWasher: boolean;
  hasKitchen: boolean;
  hasTV: boolean;
  hasWorkspace: boolean;
  isSelfCheckIn: boolean;
  isChildFriendly: boolean;
  isAccessible: boolean;
  averageRating: number;
  viewsCount: number;
  favoritesCount: number;
  hostId: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

export interface PropertyFilter {
  city?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  listingType?: ListingType;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
