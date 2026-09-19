import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AddToCartPayload,
  Cart,
  CartCheckoutPayload,
  CheckoutResponse,
  PaymentOptionsResponse,
  UpdateCartItemPayload,
} from '@ub/shared-types';
import { useAuthStore } from '../lib/store/authStore';
import {
  addToCart,
  applyCoupon,
  checkoutCart,
  clearCart,
  getCart,
  getPaymentOptions,
  removeCartItem,
  removeCoupon,
  updateCartItem,
} from '../services/cart.service';

export const CART_QUERY_KEY = ['cart'] as const;
export const PAYMENT_OPTIONS_QUERY_KEY = ['cart', 'payment-options'] as const;

export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<Cart>({
    queryKey: CART_QUERY_KEY,
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function usePaymentOptions() {
  return useQuery<PaymentOptionsResponse>({
    queryKey: PAYMENT_OPTIONS_QUERY_KEY,
    queryFn: getPaymentOptions,
    staleTime: 60 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error, AddToCartPayload>({
    mutationFn: addToCart,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error, { itemId: string; payload: UpdateCartItemPayload }>({
    mutationFn: ({ itemId, payload }) => updateCartItem(itemId, payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error, string>({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error, string>({
    mutationFn: (code) => applyCoupon(code),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  return useMutation<Cart, Error>({
    mutationFn: removeCoupon,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation<CheckoutResponse, Error, CartCheckoutPayload>({
    mutationFn: (payload) => checkoutCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
