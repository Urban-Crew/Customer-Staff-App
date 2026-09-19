import { apiClient } from '../lib/apiClient';

export interface BookingDetails {
  id: string;
  bookingCode?: string;
  state: string;
  paymentMethod?: string;
  paymentStatus?: string;
  grandTotal?: number;
  totalCost?: number;
  currency?: string;
  category?: string;
  serviceName?: string;
  scheduledFor?: string;
  createdAt?: string;
  assignedCrew?: {
    id: string;
    name: string;
    phone: string;
    rating?: string;
  } | null;
  address?: {
    formattedAddress: string;
    lat?: number;
    lng?: number;
  } | null;
  items?: Array<{
    id: string;
    serviceNameSnapshot: string;
    variantNameSnapshot: string;
    quantity: number;
    unitPriceMinor: number | string;
    lineTotalMinor: number | string;
  }>;
}

export async function getBooking(id: string): Promise<BookingDetails> {
  const { data } = await apiClient.get<BookingDetails>(`/api/v1/bookings/${id}`);
  return data;
}

export async function getMyBookings(): Promise<BookingDetails[]> {
  try {
    const { data } = await apiClient.get<BookingDetails[]>('/api/v1/bookings');
    return data;
  } catch (err) {
    return [];
  }
}
