import { PaymentMethod, PaymentStatus } from './cart';

export interface PaymentOptionsResponse {
  isCodEnabled: boolean;
  isOnlineEnabled: boolean;
  defaultMethod: PaymentMethod;
  availableMethods: PaymentMethod[];
  razorpayKeyId: string;
  lastUpdatedAt?: string;
}

export interface RazorpayPaymentIntent {
  orderId: string;
  amount: number; // In paise
  currency: string;
  keyId: string;
  businessName?: string;
  description?: string;
  notes?: Record<string, any>;
}

export interface CheckoutResponse {
  success: boolean;
  bookingId: string;
  bookingCode: string;
  state: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  grandTotal: number;
  currency: string;
  paymentIntent?: RazorpayPaymentIntent;
  message?: string;
}

export interface VerifyPaymentPayload {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  alreadyProcessed: boolean;
  bookingId: string;
  bookingCode: string;
  paymentStatus: PaymentStatus;
  state: string;
  message: string;
}

export interface CollectCodPayload {
  notes?: string;
}
