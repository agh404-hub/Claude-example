export type ListingStatus = 'active' | 'pending' | 'sold';
export type HomeStyle = 'Single Story' | 'Two Story' | 'Ranch';

export interface Home {
  id: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  style: HomeStyle;
  garage: number;
  hasPool: boolean;
  status: ListingStatus;
  listPrice?: number;
  salePrice?: number;
  listDate?: string;
  saleDate?: string;
  daysOnMarket?: number;
  pricePerSqft?: number;
  description: string;
  features: string[];
  photos: string[];
  latitude: number;
  longitude: number;
}

export interface MarketStats {
  avgListPrice: number;
  medianListPrice: number;
  avgSalePrice: number;
  medianSalePrice: number;
  avgPricePerSqft: number;
  avgDaysOnMarket: number;
  totalActiveListing: number;
  totalSoldLast90Days: number;
  listToSaleRatio: number;
  monthsOfInventory: number;
}

export interface ComparableStats {
  avgListPrice: number;
  medianListPrice: number;
  avgSalePrice: number;
  avgPricePerSqft: number;
  avgDaysOnMarket: number;
  count: number;
  estimatedValue: number;
}

export interface PriceTrendPoint {
  month: string;
  avgPrice: number;
  medianPrice: number;
  salesVolume: number;
  avgPricePerSqft: number;
}

export interface MyHome {
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  garage: number;
  hasPool: boolean;
  estimatedValue: number;
  estimatedValueLow: number;
  estimatedValueHigh: number;
  lastUpdated: string;
}
