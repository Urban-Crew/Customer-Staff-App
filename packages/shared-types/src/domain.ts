export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface ServiceVariant {
  id: string;
  name: string;
  price: number;
  strikePrice?: number;
  description?: string;
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryName?: string;
  variants?: ServiceVariant[];
  addons?: ServiceAddon[];
  /** Average rating out of 5, when the API provides one. */
  rating?: number;
  /** Flags the service for the "Top Rated" badge, when the API provides one. */
  topRated?: boolean;
}
