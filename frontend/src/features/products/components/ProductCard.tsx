import { useState } from "react";
import { Link } from "react-router-dom";
import { GoAlert } from "react-icons/go";

import ColorSwatch from "./ColorSwatch";

import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";
import { LOW_STOCK_THRESHOLD } from "../../../shared/constants/products";

import type { Product } from "../../../shared/types/product";
import type { ProductVariant } from "../../../shared/types/productVariant";
import CloudinaryImage from "../../../shared/components/common/CloudinaryImage";

type ProductCardProps = {
  product: Product;
  variants: ProductVariant[];
};

const CHECKED_KEYS = ["color", "variant", "ovenMitt"];

const ProductCard = ({ product, variants }: ProductCardProps) => {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const queryString = new URLSearchParams(selections).toString();
  const productUrl = queryString
    ? `/product/${product._id}?${queryString}`
    : `/product/${product._id}`;

  const handleOptionSelect = (
    e: React.MouseEvent,
    key: string,
    value: string,
  ) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation();
    setSelections((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // find default variant
  const defaultVariant = variants.find((v) => v.isDefault);

  // find selected variant, if any
  const selectedVariant = variants.find((v) => {
    if (Object.keys(selections).length === 0) return false;

    return Object.entries(selections).every(([optKey, optValue]) => {
      const variantKey = optKey as keyof ProductVariant;
      return v[variantKey] === optValue;
    });
  });

  // determine image to display
  // If an option is selected, show the image of selected variant
  // But if no option is selected, show image of the product
  const displayImageId =
    selectedVariant?.images?.[0]?.publicId || product.images[0]?.publicId;
  const displayAlt =
    selectedVariant?.images?.[0]?.alt || product.images[0]?.alt || product.name;

  // determine price to display
  let discountPrice = defaultVariant?.discountPrice ?? null;
  if (selectedVariant) {
    discountPrice = selectedVariant.discountPrice ?? selectedVariant.price;
  }

  let originalPrice = defaultVariant?.price;
  if (selectedVariant) {
    originalPrice = selectedVariant.price;
  }

  // stock status
  const stockCount = selectedVariant?.countInStock;
  const isSoldOut = stockCount === 0;
  const isLowStock =
    typeof stockCount === "number" &&
    stockCount > 0 &&
    stockCount <= LOW_STOCK_THRESHOLD;

  const stockLabel = isSoldOut
    ? "Sold out"
    : isLowStock
      ? `Low stock: ${stockCount} left`
      : null;

  const isLearningTower = product.category?.trim() === "Learning Tower";

  return (
    <Link to={productUrl} className="block">
      <div className="bg-white p-4">
        <div className="relative w-full aspect-7/8 mb-3 overflow-hidden">
          <CloudinaryImage
            publicId={displayImageId}
            alt={displayAlt}
            size="large"
            className="w-full h-full"
            usePlaceholder={true}
            lazy={true}
          />

          {/* SOLD OUT / LOW STOCK OVERLAY */}
          {stockLabel && (
            <div
              className={`absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2
          py-6 px-4
          bg-acloblue/30
        `}
            >
              {isSoldOut ? (
                <span className="text-red-600 font-semibold tracking-widest uppercase text-md">
                  Sold out
                </span>
              ) : (
                <>
                  <GoAlert className="text-orange-500 text-lg" aria-hidden />
                  <span className="text-orange-500 font-semibold tracking-widest uppercase text-md">
                    {stockLabel}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <h3 className="text-sm px-4 mb-2 text-center">{product.name}</h3>

      {/* COLOR SELECTORS */}
      {isLearningTower && product.options && (
        <div className="px-4 mb-3 space-y-3">
          {Object.entries(product.options).map(([key, rawValues]) => {
            const values = rawValues as string[];

            if (!CHECKED_KEYS.includes(key) || !values || values.length === 0) {
              return null;
            }

            return (
              <div key={key}>
                <div className="flex flex-wrap justify-center gap-2">
                  {values.map((value) => (
                    <ColorSwatch
                      key={value}
                      optionKey={key}
                      value={value}
                      isSelected={selections[key] === value}
                      onSelect={handleOptionSelect}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="px-4 text-center">
        <span className="inline-flex items-center justify-center gap-2 flex-wrap">
          {/* If discount exists: show original price crossed out */}
          {discountPrice != null ? (
            <>
              {originalPrice != null && (
                <span className="text-xs text-gray-400 line-through">
                  IDR {originalPrice.toLocaleString("id-ID")}
                </span>
              )}

              <span className="text-base font-semibold text-acloblue">
                IDR {discountPrice.toLocaleString("id-ID")}
              </span>
            </>
          ) : (
            <>
              {/* No discount: original price should be blue */}
              {originalPrice != null ? (
                <span className="text-base font-semibold text-acloblue">
                  IDR {originalPrice.toLocaleString("id-ID")}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Price not found</span>
              )}
            </>
          )}
        </span>
      </p>
    </Link>
  );
};

export default ProductCard;
