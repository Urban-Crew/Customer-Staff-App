export type CartStatus = 'ACTIVE' | 'CONVERTED' | 'ABANDONED';
export type PaymentMethod = 'COD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface CartPricing {
  itemsSubtotal: number;
  addonsTotal: number;
  discount: number;
  tax: number;
  platformFee: number;
  grandTotal: number;
}

export interface CartCoupon {
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
}

export interface CartItemOption {
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
}

export interface CartItemAddon {
  addonId: string;
  addonName: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  thumbnailUrl?: string | null;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  scheduledFor?: string | null;
  notes?: string | null;
  options: CartItemOption[];
  addons: CartItemAddon[];
}

export interface Cart {
  id: string;
  status: CartStatus;
  currency: string;
  itemCount: number;
  pricing: CartPricing;
  coupon: CartCoupon | null;
  items: CartItem[];
  scheduledFor?: string | null;
  updatedAt: string;
}

export interface CartOptionSelection {
  groupId: string;
  optionId: string;
  quantity?: number;
}

export interface CartAddonSelection {
  addonId: string;
  quantity?: number;
}

export interface AddToCartPayload {
  serviceId: string;
  variantId: string;
  quantity?: number;
  scheduledFor?: string;
  notes?: string;
  options?: CartOptionSelection[];
  addons?: CartAddonSelection[];
}

export interface UpdateCartItemPayload {
  quantity?: number;
  scheduledFor?: string;
  notes?: string;
}

export interface ApplyCouponPayload {
  code: string;
}

export interface CartCheckoutPayload {
  addressId: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
}
