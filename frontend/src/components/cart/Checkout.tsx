import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
// import MidtransPayButton from "./MidtransPayButton";
import ShippingOptionsModal from "./ShippingOptionsModal";
import ShippingDetailsModal from "./ShippingDetailsModal";
import LoadingOverlay from "../common/LoadingOverlay";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  createCheckout,
  calculateShippingCost,
  setSelectedShipping,
  setShippingDetails,
  clearShipping,
} from "../../redux/slices/checkoutSlice";
import type { Checkout, ShippingDetails } from "../../types/checkout";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import { fetchCartById } from "../../redux/slices/cartSlice";
import Navbar from "../common/Navbar";

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
  } = useAppSelector((state) => state.checkout);

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
  } | null>(null);

  // Only calculate shipping if postal code or cart changed
  const shouldCalculateShipping = (
    postalCode: string,
    currentCartId: string,
    totalPrice: number
  ): boolean => {
    if (!lastCalculatedRef.current) return true;

    return (
      lastCalculatedRef.current.postalCode !== postalCode ||
      lastCalculatedRef.current.cartId !== currentCartId ||
      lastCalculatedRef.current.totalPrice !== totalPrice
    );
  };

  useEffect(() => {
    if (!cartId) {
      navigate("/");
      return;
    }

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
        city: firstAddress.city,
        postalCode: firstAddress.postalCode,
        phone: firstAddress.phone,
      };
      dispatch(setShippingDetails(detailsToUse));
    }

    if (detailsToUse) {
      if (
        shouldCalculateShipping(
          detailsToUse.postalCode,
          cart._id,
          cart.totalPrice
        )
      ) {
        dispatch(
          calculateShippingCost({
            destinationPostalCode: detailsToUse.postalCode,
            cartItems: cart.products.map((p) => ({
              productId: p.productId,
              price: p.price,
              quantity: p.quantity,
            })),
          })
        )
          .unwrap()
          .then(() => {
            lastCalculatedRef.current = {
              postalCode: detailsToUse!.postalCode,
              cartId: cart._id,
              totalPrice: cart.totalPrice,
            };
          })
          .catch((error: any) => {
            dispatch(clearShipping());
            toast.error(
              error?.message ||
                "Something went wrong. Please check your address and try again.",
              { duration: 3000 }
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
    shippingDetails: ShippingDetails
  ) => {
    if (!cart || !cart.products || cart.products.length === 0) {
      return;
    }

    if (
      !shouldCalculateShipping(
        shippingDetails.postalCode,
        cart._id,
        cart.totalPrice
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
          cartItems: cart.products.map((p) => ({
            productId: p.productId,
            price: p.price,
            quantity: p.quantity,
          })),
        })
      ).unwrap();

      lastCalculatedRef.current = {
        postalCode: shippingDetails.postalCode,
        cartId: cart._id,
        totalPrice: cart.totalPrice,
      };

      dispatch(setShippingDetails(shippingDetails));
      setShowShippingDetailsModal(false);
    } catch (error: any) {
      toast.error(
        error?.message ||
          "Something went wrong. Please check your address and try again.",
        { duration: 3000 }
      );
      console.error("Error in handleShippingDetails:", error);
      throw error;
    }
  };

  const handleCreateCheckout = async () => {
    setCreatingCheckout(true);
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

    try {
      const totalWithShipping = cart.totalPrice + selectedShipping.price;

      const createdCheckout: Checkout = await dispatch(
        createCheckout({
          cartId: cart._id,
          // checkoutItems: cart.products.map((p) => ({
          //   ...p,
          //   options: p.options ?? {},
          // })),
          shippingDetails,
          paymentMethod: "BankTransfer",
          totalPrice: totalWithShipping,
          shippingCost: selectedShipping.price,
          shippingMethod: selectedShipping.courierServiceName,
          shippingCourier: selectedShipping.courierCode,
          shippingDuration: selectedShipping.duration,
        })
      ).unwrap();

      return createdCheckout._id ?? null;
    } catch (error) {
      console.error("Failed to create checkout: ", error);
    } finally {
      setCreatingCheckout(false);
    }
  };

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <>
      {shippingLoading && <LoadingOverlay show />}

      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-6 tracking-tighter">
        {showShippingDetailsModal && (
          <ShippingDetailsModal
            onClose={() => {
              setShowShippingDetailsModal(false);
              const hasNoSavedAddresses =
                !user?.shippingAddresses || user.shippingAddresses.length === 0;
              const hasNoShippingDetails = !shippingDetails?.postalCode;

              if (hasNoSavedAddresses && hasNoShippingDetails) {
                navigate("/");
              }
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
              className="text-sm text-acloblue hover:underline"
            >
              Edit Shipping Details
            </button>
          </div>

          {/* Shipping Details Display */}
          {shippingDetails?.name && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Shipping To:
              </h3>
              <p className="text-sm text-gray-800">{shippingDetails?.name}</p>
              <p className="text-sm text-gray-600">
                {shippingDetails?.address}
              </p>
              <p className="text-sm text-gray-600">
                {shippingDetails?.city}, {shippingDetails?.postalCode}
              </p>
              <p className="text-sm text-gray-600">{shippingDetails?.phone}</p>
            </div>
          )}

          {/* Products List */}
          <div className="mt-2 rounded-2xl border border-gray-100 overflow-hidden bg-white">
            <div className="divide-y divide-gray-100">
              {cart.products.map((product, index) => (
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
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <p className="text-xl text-acloblue font-semibold">
                    IDR {Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex justify-between items-center">
              <p className="text-gray-700">Subtotal</p>
              <p className="text-lg font-medium text-gray-900">
                IDR {Number(cart.totalPrice).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="mt-3 flex justify-between items-start">
              <p className="text-gray-700">Shipping</p>
              <div className="text-right">
                {selectedShipping ? (
                  <>
                    <p className="text-lg font-medium text-gray-900">
                      IDR{" "}
                      {Number(selectedShipping.price).toLocaleString("id-ID")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowShippingModal(true)}
                      className="mt-1 text-sm text-acloblue hover:underline"
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
                IDR{" "}
                {Number(
                  cart.totalPrice + (selectedShipping?.price || 0)
                ).toLocaleString("id-ID")}
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
        />
      </div>
    </>
  );
};

export default Checkout;
