import type { PaymentProof } from "./checkout";

export interface OrderItem {
  productId: string;
  productVariantId: string;
  name: string;
  image: string;
  price: number;
  options: Record<string, any>;
  quantity: number;
}

export interface ShippingDetails {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface Order {
  _id: string;
  orderId: string;
  checkout: string; // checkoutId
  user: string | { name: string; email: string };
  orderItems: OrderItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  paymentProof?: PaymentProof;
  shippingCost?: number;
  shippingMethod?: string;
  shippingCourier?: string;
  shippingDuration?: string;
  totalPrice: number;
  isPaid: boolean; // not used until midtrans
  paidAt?: string;
  deliveredAt?: string;
  paymentDetails?: any;
  status:
    | "pending"
    | "rejected"
    | "processing"
    | "shipping"
    | "delivered"
    | "completed"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}
