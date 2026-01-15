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

export interface CancelRequest {
  reason: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "cancelling"
  | "rejected"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "exchanged";

export type OrdersCategory = "all" | "pending_action" | "resolved" | "failed" | "ongoing";

export type FetchOrdersParams = {
  category?: OrdersCategory;
  status?: OrderStatus | OrderStatus[]; // optional for future use
  page?: number;
  limit?: number;
};

export type FetchOrdersResponse = {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export interface Order {
  _id: string;
  orderId: string;
  checkout: string; // checkoutId
  user: string | { name: string; email: string };
  orderItems: OrderItem[];
  shippingDetails: ShippingDetails;
  paymentMethod: string;
  paymentProof?: PaymentProof;
  noteToSeller?: string;
  cancelRequest?: CancelRequest;
  adminRemarks?: string;
  shippingCost?: number;
  shippingMethod?: string;
  shippingCourier?: string;
  shippingDuration?: string;
  totalPrice: number;
  isPaid: boolean; // not used until midtrans
  paidAt?: string;
  trackingLink?: string;
  deliveredAt?: string;
  paymentDetails?: any;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
