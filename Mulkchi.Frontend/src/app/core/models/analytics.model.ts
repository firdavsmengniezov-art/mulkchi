export interface PricePredictionRequest {
  area: number;
  bedrooms: number;
  bathrooms: number;
  region: number; // Changed from string to number to match backend
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  isRenovated: boolean;
  hasElevator: boolean;
  distanceToCityCenter: number;
}

export interface PricePredictionResponse {
  predictedPrice: number;
  currency: string;
  confidence: string;
  priceRange: { min: number; max: number; };
  basedOnProperties: number;
  recommendation: string;
}

// Region mapping for frontend
export const REGION_MAP: { [key: string]: number } = {
  'Toshkent': 0,
  'Toshkent viloyati': 1,
  'Samarqand': 2,
  'Buxoro': 3,
  'Andijon': 4,
  'Fargona': 5,
  'Namangan': 6,
  'Qashqadaryo': 7,
  'Surxondaryo': 8,
  'Xorazm': 9,
  'Navoiy': 10,
  'Jizzax': 11,
  'Sirdaryo': 12,
  'Qoraqalpogiston': 13
};
