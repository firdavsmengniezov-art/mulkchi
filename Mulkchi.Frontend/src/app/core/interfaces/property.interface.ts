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
  mahalla: string;
  latitude?: number;
  longitude?: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasMetroNearby: boolean;
  hasElevator: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWashingMachine: boolean;
  hasDishwasher: boolean;
  hasTV: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasSecurity: boolean;
  hasGym: boolean;
  isRenovated: boolean;
  isPetFriendly: boolean;
  isSmokingAllowed: boolean;
  averageRating: number;
  viewsCount: number;
  favoritesCount: number;
  hostId: string;
  currency: Currency;
  exchangeRate: number;
  createdDate: string;
  updatedDate: string;
}

export enum PropertyType {
  Apartment = 0,
  House = 1,
  Office = 2,
  Land = 3,
  Commercial = 4
}

export enum PropertyCategory {
  Residential = 0,
  Commercial = 1,
  Industrial = 2
}

export enum PropertyStatus {
  Available = 0,
  Rented = 1,
  Sold = 2,
  Inactive = 3
}

export enum ListingType {
  Rent = 0,
  Sale = 1,
  DailyRent = 2
}

export enum UzbekistanRegion {
  Toshkent = 0,
  Samarqand = 1,
  Buxoro = 2,
  Farg'ona = 3,
  Andijon = 4,
  Namangan = 5,
  Qashqadaryo = 6,
  Surxondaryo = 7,
  Jizzax = 8,
  Sirdaryo = 9,
  Xorazm = 10,
  Qoraqalpog'iston = 11,
  ToshkentViloyati = 12,
  Navoiy = 13
}

export enum Currency {
  USD = 0,
  UZS = 1
}
