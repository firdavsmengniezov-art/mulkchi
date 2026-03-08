export enum ListingType { Rent = 0, Sale = 1, ShortTermRent = 2 }
export enum PropertyType { Apartment = 0, House = 1, Villa = 2, Room = 3, Office = 4, Land = 5, Commercial = 6 }
export enum PropertyCategory { Residential = 0, Commercial = 1, Industrial = 2, Agricultural = 3 }
export enum PropertyStatus { Active = 0, Inactive = 1, Pending = 2, Rejected = 3, Deleted = 4 }
export enum UzbekistanRegion {
  ToshkentShahar = 0, ToshkentViloyat = 1, Samarqand = 2, Buxoro = 3,
  Andijon = 4, Fargona = 5, Namangan = 6, Qashqadaryo = 7,
  Surxondaryo = 8, Xorazm = 9, Navoiy = 10, Jizzax = 11,
  Sirdaryo = 12, Qoraqalpogiston = 13
}

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
