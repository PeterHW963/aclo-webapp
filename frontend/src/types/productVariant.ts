import type { ProductCategory, ProductImage } from "./product";

export interface ProductVariant {
  _id: string;
  productId: string; // ref Product
  sku: string;
  adminName: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  isAvailable: boolean;
  category: ProductCategory;
  // option picks for this variant
  color?: string;
  variant?: string;
  stabiliser?: string;
  ovenMitt?: string;
  isDefault?: boolean;
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductVariantPayload {
  productId: string;
  sku: string;
  name: string;
  price: number;
  discountPrice?: number;
  isAvailable?: boolean;
  category: ProductCategory;
  color?: string;
  variant?: string;
  images: ProductImage[];
}

export interface UpdateProductVariantPayload {
  productId: string;
  variantId: string;
  variantData: Partial<ProductVariant>;
}
