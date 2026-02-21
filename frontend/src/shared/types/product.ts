export interface ProductImage {
  publicId: string;
  alt?: string;
}

export interface PricingRule {
  discountType: "none" | "fixed";
  amount: number; // if fixed: amount in your currency unit (e.g. IDR)
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export type ProductCategory =
  | "Learning Tower"
  | "Stool"
  | "Utensils"
  | "Accessories";

export interface ProductOptions {
  color?: string[];
  stabiliser?: string[];
  variant?: string[];
  ovenMitt?: string[];
}

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  description: string;
  options?: ProductOptions;
  images: ProductImage[];
  isListed: boolean;
  rating: number;
  numReviews: number;
  user: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensions?: ProductDimensions;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  options?: ProductOptions;
  images: ProductImage[];
  isListed?: boolean; // backend default false, so optional is fine
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  dimensions?: ProductDimensions;
  weight?: number;
}

export interface UpdateProductPayload {
  id: string;
  productData: Partial<Product>;
}
