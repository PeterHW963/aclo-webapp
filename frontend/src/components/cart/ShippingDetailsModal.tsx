import { useState, useEffect, type FormEvent } from "react";
import { IoMdClose } from "react-icons/io";
import type { ShippingDetails } from "../../types/checkout";
import type { ShippingAddress } from "../../types/user";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
  addShippingAddress,
  updateShippingAddress,
} from "../../redux/slices/authSlice";

interface ShippingDetailsModalProps {
  onClose: () => void;
  onSubmit: (details: ShippingDetails) => Promise<void>;
  userEmail?: string;
  isCalculating: boolean;
  initialMode?: "selection" | "form"; // to control initial view
}

const ShippingDetailsModal = ({
  onClose,
  onSubmit,
  isCalculating,
  initialMode = "form",
}: ShippingDetailsModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { shippingDetails: reduxShippingDetails } = useAppSelector(
    (state) => state.checkout
  );

  const [mode, setMode] = useState<"selection" | "form">("form");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressInView, setSelectedAddressInView] =
    useState<string>("");

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  // Set initial mode based on prop and user addresses
  useEffect(() => {
    if (user?.shippingAddresses && user.shippingAddresses.length > 0) {
      setMode(initialMode);

      let matchingAddress = null;
      if (reduxShippingDetails) {
        matchingAddress = user.shippingAddresses.find(
          (addr) => addr.postalCode === reduxShippingDetails.postalCode
        );
      }

      const addressToUse = matchingAddress || user.shippingAddresses[0]; // first address as fallback
      setSelectedAddressInView(addressToUse._id);

      if (initialMode === "form") {
        setShippingDetails({
          name: addressToUse.name,
          address: addressToUse.address,
          city: addressToUse.city,
          postalCode: addressToUse.postalCode,
          phone: addressToUse.phone,
        });
      }
    } else {
      setMode("form");
      setIsNewAddress(true);
    }
  }, [user, initialMode, reduxShippingDetails]);

  const handleSelectAddress = async (address: ShippingAddress) => {
    try {
      await onSubmit({
        name: address.name,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode,
        phone: address.phone,
      });
    } catch (error) {
      // If shipping calculation fails - there's issue with address
      // switch to form view to show the address
      console.error("Error selecting address:", error);
      setShippingDetails({
        name: address.name,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode,
        phone: address.phone,
      });
      setMode("form");
    }
  };

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddressId(address._id);
    setIsNewAddress(false);
    setShippingDetails({
      name: address.name,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      phone: address.phone,
    });
    setMode("form");
  };

  const handleAddNewAddress = () => {
    setEditingAddressId(null);
    setIsNewAddress(true);
    setShippingDetails({
      name: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
    });
    setMode("form");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await onSubmit(shippingDetails);

      // Only save valid addresses (ie shipping calculation passed)
      if (user) {
        if (isNewAddress && saveAddress) {
          const resultAction = await dispatch(
            addShippingAddress(shippingDetails)
          );

          if (addShippingAddress.fulfilled.match(resultAction)) {
            const updatedUser = resultAction.payload;

            if (
              updatedUser.shippingAddresses &&
              updatedUser.shippingAddresses.length > 0
            ) {
              const newAddress =
                updatedUser.shippingAddresses[
                  updatedUser.shippingAddresses.length - 1
                ];
              setSelectedAddressInView(newAddress._id);
            }
          }
        } else if (!isNewAddress && editingAddressId) {
          // Always update existing address when editing
          const resultAction = await dispatch(
            updateShippingAddress({
              addressId: editingAddressId,
              updates: shippingDetails,
            })
          );
          if (updateShippingAddress.fulfilled.match(resultAction)) {
            setSelectedAddressInView(editingAddressId);
          }
        }
      }
    } catch (error) {
      console.error("Error on submitting shipping details:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-lg border max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 z-10"
        >
          <IoMdClose className="h-6 w-6 hover:text-gray-600 cursor-pointer" />
        </button>

        <div className="overflow-y-auto px-6 py-6">
          {mode === "selection" ? (
            // Address Selection View - shows list of user's saved addresses
            <div>
              <h2 className="text-2xl uppercase mb-6">My Addresses</h2>

              <div className="space-y-4 mb-6">
                {user?.shippingAddresses?.map((address) => (
                  <div
                    key={address._id}
                    className="border rounded-lg p-5 hover:border-gray-400 transition cursor-pointer"
                    onClick={() => {
                      setSelectedAddressInView(address._id);
                      handleSelectAddress(address);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                            selectedAddressInView === address._id
                              ? "border-acloblue"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressInView === address._id && (
                            <div className="w-3 h-3 rounded-full bg-acloblue" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-base">
                              {address.name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {address.phone}
                            </p>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            {address.address}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {address.city}, {address.postalCode}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address);
                        }}
                        className="text-acloblue text-sm font-medium shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddNewAddress}
                className="w-full bg-black text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition"
              >
                Add New Address
              </button>
            </div>
          ) : (
            // Form View - for adding/editing an address
            <div>
              <div className="flex items-center gap-2 mb-4">
                {user?.shippingAddresses &&
                  user.shippingAddresses.length > 0 && (
                    <button
                      onClick={() => setMode("selection")}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ←
                    </button>
                  )}
                <h2 className="text-2xl uppercase text-acloblue">
                  {isNewAddress ? "Add New Address" : "Edit Address"}
                </h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Please enter your shipping details before proceeding to order.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={shippingDetails.name}
                    onChange={(e) =>
                      setShippingDetails({
                        ...shippingDetails,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700">Address *</label>
                  <input
                    type="text"
                    value={shippingDetails.address}
                    onChange={(e) =>
                      setShippingDetails({
                        ...shippingDetails,
                        address: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                    required
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700">City *</label>
                    <input
                      type="text"
                      value={shippingDetails.city}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          city: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Postal Code *</label>
                    <input
                      type="text"
                      value={shippingDetails.postalCode}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                      required
                      minLength={5}
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700">
                    Whatsapp Phone Number *
                  </label>

                  <p className="mt-1 text-sm text-gray-500">
                    We may contact you via WhatsApp for order updates (e.g.
                    delivery updates, reminders, or support if any issues arise)
                    and promotions.
                  </p>

                  <input
                    type="tel"
                    value={shippingDetails.phone}
                    onChange={(e) =>
                      setShippingDetails({
                        ...shippingDetails,
                        phone: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-acloblue focus:border-acloblue"
                    required
                  />
                </div>

                {/* Save Address Checkbox */}
                {isNewAddress && (
                  <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">
                        Save this address to my account
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="flex-1 bg-acloblue text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:opacity-80 transition"
                  >
                    {isCalculating ? "Loading..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingDetailsModal;
