export interface Photo {
  id: string;
  url: string;
  caption?: string;
  createdAt: Date;
}

export interface Memory {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  priceRange: 1 | 2 | 3 | 4;
  rating: number;
  photos: Photo[];
  memories: Memory[];
  visited: boolean;
  visitedDate?: Date;
  wantToGo: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface ShareData {
  restaurants: Restaurant[];
  sharedBy: string;
  sharedAt: Date;
  message?: string;
}

export type ViewMode = 'map' | 'list' | 'memories';

export type FilterType = 'all' | 'visited' | 'wantToGo';

export interface Recommendation {
  type: 'memory' | 'suggestion';
  restaurant: Restaurant;
  message: string;
}
