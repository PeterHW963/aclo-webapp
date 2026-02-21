import { RiDeleteBinLine } from "react-icons/ri";

import { useAppDispatch } from "../../../app/hooks";

import { removeFromCart, updateCartItemQuantity } from "../slices/cartSlice";

import type { Cart } from "../../../shared/types/cart";
import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";

type CartContentsProps = {
  cart: Cart;
  userId?: string;
  guestId?: string;
};

const CartContents = ({ cart, userId, guestId }: CartContentsProps) => {
  const dispatch = useAppDispatch();

  // handle adding/subtracting to cart
  const handleAddToCart = (
    productVariantId: string,
    delta: number,
    quantity: number,
    options?: Record<string, any>,
  ) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productVariantId,
          quantity: newQuantity,
          options,
          guestId,
          userId,
        }),
      );
    }
  };

  const handleRemoveFromCart = (
    productVariantId: string,
    options?: Record<string, any>,
  ) => {
    dispatch(removeFromCart({ productVariantId, options, guestId, userId }));
  };

  return (
    <div>
      {cart.products.map((product, index) => (
        <div
          key={index}
          className="flex items-start justify-between py-4 border-b"
        >
          <div className="flex items-start">
            <img
              src={cloudinaryImageUrl(product.image)}
              alt={product.name}
              className="w-20 h-24 object-cover mr-4 rounded"
            />
            <div>
              <h3>{product.name}</h3>
              {product.options && Object.keys(product.options).length > 0 && (
                <p className="text-sm text-gray-500">
                  {Object.entries(product.options)
                    .map(([key, value]) => {
                      const displayValue = String(value);
                      // capitalise the first letter of key
                      const label = key.charAt(0).toUpperCase() + key.slice(1);
                      return `${label}: ${displayValue}`;
                    })
                    .join(" | ")}
                </p>
              )}

              <div className="flex items-center mt-2 gap-1">
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productVariantId,
                      -1,
                      product.quantity,
                      product.options,
                    )
                  }
                  className="border rounded px-2 py-0.5 text-xl font-medium"
                >
                  -
                </button>
                <span className="border rounded px-4 py-1">
                  {product.quantity}
                </span>
                <button
                  onClick={() =>
                    handleAddToCart(
                      product.productVariantId,
                      1,
                      product.quantity,
                      product.options,
                    )
                  }
                  className="border rounded px-1.75 py-0.5 text-xl font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div>
            <p>IDR {Number(product.price).toLocaleString("id-ID")}</p>
            <button
              onClick={() =>
                handleRemoveFromCart(product.productVariantId, product.options)
              }
            >
              <RiDeleteBinLine className="h-6 w-6 mt-2 text-red-700 hover:text-red-900" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
