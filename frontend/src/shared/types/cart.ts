export interface CartItem {
  productId: string; // ObjectId as string
  productVariantId: string;
  name: string;
  image: string;
  price: number;
  options: Record<string, any>;
  quantity: number;
}

export interface Cart {
  _id: string;
  user?: string; // ObjectId of user
  guestId?: string;
  products: CartItem[];
  totalPrice: number;
  createdAt?: string;
  updatedAt?: string;
}
