export interface CheckoutItem {
  productId: string;
  productVariantId: string;
  name: string;
  image: string;
  price: number;
  options?: Record<string, any>;
  quantity: number;
  weight?: number;
}

export interface ShippingDetails {
  name: string;
  address: string;
  addressDetails: string;
  city: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
}

export interface PaymentProof {
  publicId: string;
  uploadedAt: string;
  status: "none" | "pending" | "approved" | "rejected";
}

export interface Checkout {
  _id: string;
  user: string | { name: string; email: string };
  checkoutItems: CheckoutItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  paymentProof?: PaymentProof;
  noteToSeller?: string;
  totalPrice: number;
  isPaid: boolean; // keep this field but will alw stay false until midtrans implemented
  paidAt?: string;
  paymentDetails?: Record<string, any>; // use this only when using midtrans
  shippingCost?: number;
  shippingMethod?: string;
  shippingCourier?: string;
  shippingDuration?: string;
  expiresAt: string;
  isExpired: boolean;
  isFinalized: boolean; // switch to true when user is done placing order
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingOption {
  courierName: string;
  courierCode: string;
  courierServiceName: string;
  courierServiceCode: string;
  description: string;
  duration: string;
  price: number;
  type: string;
}

export interface ShippingCostRequest {
  destinationPostalCode: string;
  destinationLatitude: number;
  destinationLongitude: number;
  cartItems: Array<{
    productId: string;
    price: number;
    quantity: number;
  }>;
}

export interface ShippingCostResponse {
  success: boolean;
  options: ShippingOption[];
  origin?: any;
  destination?: any;
  gojekDisabled: boolean;
}

// Payload when calling createCheckout
export interface CreateCheckoutPayload {
  cartId: string;
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  totalPrice: number;
  shippingCost?: number;
  shippingMethod?: string;
  shippingCourier?: string;
  shippingDuration?: string;
}

export type FetchCheckoutsParams = {
  page?: number;
  limit?: number;
  status: "valid" | "expired";
};

export type FetchCheckoutsResponse = {
  checkouts: Checkout[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
