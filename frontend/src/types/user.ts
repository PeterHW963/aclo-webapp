export interface ShippingAddress {
  _id: string;
  name: string;
  address: string;
  addressDetails: string;
  city: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  isVerified: boolean;
  shippingAddresses?: ShippingAddress[];
  createdAt?: string; // backend currently doesn't return these, but maybe for future improvements
  updatedAt?: string;
}

// ==== Types for Admin actions =====
export interface AddUserPayload {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "admin";
}

export interface UpdateUserPayload {
  id: string;
  name?: string;
  email?: string;
  role?: "customer" | "admin";
}

export interface DeleteUserPayload {
  id: string;
}
