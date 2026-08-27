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

export interface Service {
  id: string;
  name: string;
  imageUrl: string;
}
