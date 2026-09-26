import type {
  Cart,
  AddToCartPayload,
  UpdateCartItemPayload,
  CartCheckoutPayload,
  PaymentOptionsResponse,
  CheckoutResponse,
} from '@ub/shared-types';
import { apiClient } from '../lib/apiClient';

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/api/v1/cart');
  return data;
}

export async function addToCart(payload: AddToCartPayload): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/api/v1/cart/items', payload);
  return data;
}

export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload,
): Promise<Cart> {
  const { data } = await apiClient.patch<Cart>(`/api/v1/cart/items/${itemId}`, payload);
  return data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>(`/api/v1/cart/items/${itemId}`);
  return data;
}

export async function clearCart(): Promise<void> {
  await apiClient.delete('/api/v1/cart/clear');
}

export async function applyCoupon(code: string): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/api/v1/cart/apply-coupon', { code });
  return data;
}

export async function removeCoupon(): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/api/v1/cart/remove-coupon');
  return data;
}

export async function getPaymentOptions(): Promise<PaymentOptionsResponse> {
  const { data } = await apiClient.get<PaymentOptionsResponse>('/api/v1/cart/payment-options');
  return data;
}

export async function checkoutCart(payload: CartCheckoutPayload): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>('/api/v1/cart/checkout', payload);
  return data;
}
