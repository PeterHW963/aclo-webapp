import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import ShippingOptionsModal from "./ShippingOptionsModal";
import ShippingDetailsModal from "./ShippingDetailsModal";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import { createCheckout } from "../slices/checkoutSlice";
import {
  calculateShippingCost,
  setSelectedShipping,
  setShippingDetails,
  clearShipping,
} from "../slices/shippingSlice";
import {
  fetchCartById,
  removeFromCart,
  updateCartItemQuantity,
} from "../slices/cartSlice";

import type {
  Checkout,
  ShippingDetails,
  ShippingOption,
} from "../../../shared/types/checkout";
import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";

import LoadingOverlay from "../../../shared/components/common/LoadingOverlay";
import Navbar from "../../../shared/components/common/Navbar";
import type { CartItem } from "../../../shared/types/cart";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, loading, error } = useAppSelector((state) => state.cart);
  const { cartId } = useParams<{ cartId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const {
    shippingOptions,
    selectedShipping,
    shippingLoading,
    shippingDetails,
    gojekDisabled,
  } = useAppSelector((state) => state.shipping);

  const [creatingCheckout, setCreatingCheckout] = useState<boolean>(false); // prevent double-clicking
  const [showShippingModal, setShowShippingModal] = useState<boolean>(false);
  const [showShippingDetailsModal, setShowShippingDetailsModal] =
    useState(false);
  const [modalMode, setModalMode] = useState<"selection" | "form">("form");

  // Track last calculated shipping to prevent duplicate API calls
  const lastCalculatedRef = useRef<{
    postalCode: string;
    cartId: string;
    totalPrice: number;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Only calculate shipping if postal code or cart changed
  const shouldCalculateShipping = (
    postalCode: string,
    currentCartId: string,
    totalPrice: number,
    latitude: number,
    longitude: number,
  ): boolean => {
    if (!lastCalculatedRef.current) return true;

    return (
      lastCalculatedRef.current.postalCode !== postalCode ||
      lastCalculatedRef.current.cartId !== currentCartId ||
      lastCalculatedRef.current.totalPrice !== totalPrice ||
      lastCalculatedRef.current.latitude !== latitude ||
      lastCalculatedRef.current.longitude !== longitude
    );
  };

  useEffect(() => {
    if (!cartId) {
      navigate("/");
      return;
    }

    // ensure no infinite loop of cart loading state.
    // If this effect runs while loading is still true, loading will stay true all the time
    if (loading) return;

    if (!cart?._id || cart._id !== cartId) {
      dispatch(fetchCartById({ cartId }));
      return;
    }

    if (!loading && (!cart.products || cart.products.length === 0)) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId, cart?._id, cart?.products?.length, loading, dispatch, navigate]);

  // Auto-fill shipping details + calculate shipping if user has saved addresses
  useEffect(() => {
    if (!cart?.products || cart.products.length === 0) {
      return;
    }

    let detailsToUse: ShippingDetails | null = null;

    if (shippingDetails?.postalCode) {
      detailsToUse = shippingDetails;
    } else if (user?.shippingAddresses && user.shippingAddresses.length > 0) {
      const firstAddress = user.shippingAddresses[0];
      detailsToUse = {
        name: firstAddress.name,
        address: firstAddress.address,
        addressDetails: firstAddress.addressDetails,
        city: firstAddress.city,
        postalCode: firstAddress.postalCode,
        phone: firstAddress.phone,
        latitude: firstAddress.latitude,
        longitude: firstAddress.longitude,
      };
      dispatch(setShippingDetails(detailsToUse));
    }

    if (detailsToUse) {
      if (
        shouldCalculateShipping(
          detailsToUse.postalCode,
          cart._id,
          cart.totalPrice,
          detailsToUse.latitude,
          detailsToUse.longitude,
        )
      ) {
        dispatch(
          calculateShippingCost({
            destinationPostalCode: detailsToUse.postalCode,
            destinationLatitude: detailsToUse.latitude,
            destinationLongitude: detailsToUse.longitude,
            cartItems: cart.products.map((p: CartItem) => ({
              productId: p.productId,
              price: p.price,
              quantity: p.quantity,
            })),
          }),
        )
          .unwrap()
          .then(() => {
            lastCalculatedRef.current = {
              postalCode: detailsToUse!.postalCode,
              cartId: cart._id,
              totalPrice: cart.totalPrice,
              latitude: detailsToUse!.latitude,
              longitude: detailsToUse!.longitude,
            };
          })
          .catch((error: any) => {
            dispatch(clearShipping());
            toast.error(
              error?.message ||
                "Something went wrong. Please check your address and try again.",
              { duration: 3000 },
            );
          });
      }
    } else {
      // No saved addresses and no existing details, show modal to add new address
      setModalMode("form");
      setShowShippingDetailsModal(true);
    }
  }, [
    user,
    cart?.products,
    cart?._id,
    cart?.totalPrice,
    shippingDetails,
    dispatch,
  ]);

  // Clear ref when component unmounts
  useEffect(() => {
    return () => {
      lastCalculatedRef.current = null;
    };
  }, []);

  const handleShippingDetailsSubmit = async (
    shippingDetails: ShippingDetails,
  ) => {
    if (!cart || !cart.products || cart.products.length === 0) {
      return;
    }

    if (
      !shouldCalculateShipping(
        shippingDetails.postalCode,
        cart._id,
        cart.totalPrice,
        shippingDetails.latitude,
        shippingDetails.longitude,
      )
    ) {
      dispatch(setShippingDetails(shippingDetails));
      setShowShippingDetailsModal(false);
      return;
    }

    try {
      await dispatch(
        calculateShippingCost({
          destinationPostalCode: shippingDetails.postalCode,
          destinationLatitude: shippingDetails.latitude,
          destinationLongitude: shippingDetails.longitude,
          cartItems: cart.products.map((p: CartItem) => ({
            productId: p.productId,
            price: p.price,
            quantity: p.quantity,
          })),
        }),
      ).unwrap();

      lastCalculatedRef.current = {
        postalCode: shippingDetails.postalCode,
        cartId: cart._id,
        totalPrice: cart.totalPrice,
        latitude: shippingDetails.latitude,
        longitude: shippingDetails.longitude,
      };

      dispatch(setShippingDetails(shippingDetails));
      setShowShippingDetailsModal(false);
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Something went wrong. Please check your address and try again.",
        { duration: 3000 },
      );
      console.error("Error in handleShippingDetails:", error);
      throw error;
    }
  };

  // helper function for changing courier option display
  const getDisplayServiceName = (option: ShippingOption) => {
    // prioritize service code (more stable than names)
    if (option.courierCode.toLowerCase() === "jne") {
      if (option.courierServiceCode === "jtr") return "Cargo";
      if (option.courierServiceCode === "reg") return "Reguler";
    }
    // fallback: show the courier & service name
    return `${option.courierName} - ${option.courierServiceName}`;
  };

  const handleCreateCheckout = async () => {
    if (!cart || !cart.products || cart.products.length === 0) {
      return;
    }

    if (!selectedShipping) {
      alert("Please select a shipping method");
      return;
    }

    if (!shippingDetails) {
      alert("Please provide shipping details");
      return;
    }

    setCreatingCheckout(true);
    try {
      const subtotal = Number(cart.totalPrice);
      const discount = Number(calculateDiscount(subtotal));
      const shippingCost = Number(selectedShipping.price);

      const totalPrice = subtotal - discount + shippingCost;

      const createdCheckout: Checkout = await dispatch(
        createCheckout({
          cartId: cart._id,
          shippingDetails,
          paymentMethod: "BankTransfer",
          subtotal: subtotal,
          discount: discount,
          totalPrice: totalPrice,
          shippingCost: selectedShipping.price,
          shippingMethod: selectedShipping.courierServiceName,
          shippingCourier: selectedShipping.courierCode,
          shippingDuration: selectedShipping.duration,
        }),
      ).unwrap();

      return createdCheckout._id ?? null;
    } catch (error) {
      console.error("Failed to create checkout: ", error);
    } finally {
      setCreatingCheckout(false);
    }
  };

  const calculateDiscount = (totalPrice: number): number => {
    if (totalPrice >= 1500000) {
      return (5 / 100) * totalPrice; // 5% discount
    }
    return 0;
  };

  const handleChangeQty = (
    productVariantId: string,
    delta: number,
    quantity: number,
    options?: Record<string, any>,
  ) => {
    if (!user && !cart?.guestId) {
      toast.error("Missing user id for cart update");
      return;
    }

    const newQuantity = quantity + delta;
    const userId = user?._id;

    if (newQuantity === 0) {
      dispatch(removeFromCart({ productVariantId, options, userId }));
      return;
    }

    if (newQuantity >= 1) {
      dispatch(
        updateCartItemQuantity({
          productVariantId,
          quantity: newQuantity,
          options,
          userId,
        }),
      );
    }
  };

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty</p>;
  }

  const subtotal = Number(cart.totalPrice);
  const discount = Number(calculateDiscount(cart.totalPrice));
  const shippingCost = Number(selectedShipping?.price || 0);

  const total = subtotal - discount + shippingCost;

  return (
    <>
      {shippingLoading && <LoadingOverlay show />}

      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-6 tracking-tighter">
        {showShippingDetailsModal && (
          <ShippingDetailsModal
            onClose={() => {
              setShowShippingDetailsModal(false);
            }}
            onSubmit={handleShippingDetailsSubmit}
            userEmail={user?.email}
            isCalculating={shippingLoading}
            initialMode={modalMode}
          />
        )}

        {/* Order Summary Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl uppercase text-acloblue">Order Summary</h2>
            <button
              type="button"
              onClick={() => {
                setModalMode("selection");
                setShowShippingDetailsModal(true);
              }}
              className="text-sm text-white px-3 py-2 -mr-2 rounded-md bg-acloblue transition hover:opacity-80 hover:cursor-pointer"
            >
              Edit Shipping Details
            </button>
          </div>

          {/* Shipping Details Display */}
          {shippingDetails?.postalCode ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Shipping To:
              </h3>
              <p className="text-sm text-gray-800">{shippingDetails.name}</p>
              <p className="text-sm text-gray-600">
                {shippingDetails.addressDetails}
              </p>
              <p className="text-sm text-gray-600">
                {shippingDetails.city}, {shippingDetails.postalCode}
              </p>
              <p className="text-sm text-gray-600">{shippingDetails.phone}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Shipping details
                </h3>
                <p className="text-sm text-gray-600">
                  No shipping details yet. Add an address to see shipping
                  options.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalMode("form");
                  setShowShippingDetailsModal(true);
                }}
                className="shrink-0 text-sm text-acloblue hover:underline"
              >
                Add now
              </button>
            </div>
          )}

          {/* Products List */}
          <div className="mt-2 rounded-2xl border border-gray-100 overflow-hidden bg-white">
            <div className="divide-y divide-gray-100">
              {cart.products.map((product: CartItem, index: number) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={cloudinaryImageUrl(product.image)}
                      alt={product.name}
                      className="w-20 h-24 object-cover rounded-xl border border-gray-100"
                    />
                    <div>
                      <h3 className="text-[15px] font-medium text-gray-900">
                        {product.name}
                      </h3>

                      {product.options &&
                        Object.keys(product.options).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(product.options).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="text-xs px-2.5 py-1 rounded-full bg-acloblue/10 text-acloblue"
                                >
                                  {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                                  {String(value)}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex h-24 flex-col items-end">
                    <p className="text-xl text-acloblue font-semibold">
                      IDR {Number(product.price).toLocaleString("id-ID")}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleChangeQty(
                            product.productVariantId,
                            -1,
                            product.quantity,
                            product.options,
                          )
                        }
                        className="px-2.5 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300"
                      >
                        -
                      </button>

                      <span className="text-base font-medium w-8 text-center">
                        {product.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleChangeQty(
                            product.productVariantId,
                            1,
                            product.quantity,
                            product.options,
                          )
                        }
                        className="px-2.5 py-1 bg-gray-200 rounded text-lg hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-700">Subtotal</p>
              <p className="text-lg font-medium text-gray-900">
                IDR {Number(subtotal).toLocaleString("id-ID")}
              </p>
            </div>
            {discount !== 0 && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-700">Discount</p>
                <p className="text-lg font-medium text-gray-900">
                  - IDR {Number(discount).toLocaleString("id-ID")}
                </p>
              </div>
            )}

            <div className="mt-2 flex justify-between items-start">
              <p className="text-gray-700">Shipping</p>
              <div className="text-right">
                {selectedShipping ? (
                  <>
                    <p className="text-lg font-medium text-gray-900">
                      IDR{" "}
                      {Number(selectedShipping.price).toLocaleString("id-ID")}
                    </p>
                    <p className="text-sm text-gray-400">
                      Shipping option: {getDisplayServiceName(selectedShipping)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowShippingModal(true)}
                      className="mt-1 text-sm text-acloblue hover:underline hover:cursor-pointer"
                    >
                      View options
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                    Select shipping
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-900">Total</p>
              <p className="text-2xl font-semibold text-acloblue">
                IDR {Number(total).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={async () => {
                const id = await handleCreateCheckout(); // return checkout
                if (id) navigate(`/payment/${id}`);
              }}
              disabled={creatingCheckout || !selectedShipping}
              className="w-full bg-acloblue text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-80 transition cursor-pointer"
            >
              Continue to Payment
            </button>
          </div>
        </div>

        <ShippingOptionsModal
          isOpen={showShippingModal}
          onClose={() => setShowShippingModal(false)}
          shippingOptions={shippingOptions}
          selectedShipping={selectedShipping}
          onSelectShipping={(option) => {
            dispatch(setSelectedShipping(option));
          }}
          gojekDisabled={gojekDisabled}
        />
      </div>
    </>
  );
};

export default Checkout;
