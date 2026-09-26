import { useQuery } from '@tanstack/react-query';
import { getBooking, getMyBookings, type BookingDetails } from '../services/booking.service';

export const BOOKINGS_QUERY_KEY = ['bookings'] as const;

export function useMyBookings() {
  return useQuery<BookingDetails[]>({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: getMyBookings,
    staleTime: 15 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useBookingDetails(bookingId: string) {
  return useQuery<BookingDetails>({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Auto-poll while waiting for crew assignment or payment
      if (data?.state === 'BROADCASTING' || data?.state === 'PENDING_PAYMENT') {
        return 4000;
      }
      return false;
    },
  });
}
