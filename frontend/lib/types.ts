export type PropertyImage = { id: string; url: string };

export type Location = {
  city: string;
  commune?: string | null;
  quarter?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type Category = { id: string; slug: string; name: string; icon?: string | null };

export type Property = {
  id: string;
  title: string;
  description: string;
  price: string | number;
  currency: string;
  transactionType: 'RENT' | 'SALE' | 'SHORT_STAY';
  bedrooms?: number | null;
  rooms?: number | null;
  hasInternalShower?: boolean;
  hasInternalToilet?: boolean;
  hasParking?: boolean;
  hasWater?: boolean;
  hasElectricity?: boolean;
  hasWifi?: boolean;
  isFurnished?: boolean;
  surfaceArea?: number | null;
  isVerified: boolean;
  isDemo?: boolean;
  status: string;
  images: PropertyImage[];
  location?: Location | null;
  category?: Category;
  owner?: { isProVerified?: boolean; profile?: { firstName?: string; lastName?: string } };
};

export type SearchResult = {
  items: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
