import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logoutAndReset } from "../utils/logoutReset";

import MyOrdersPage from "./MyOrdersPage";
import ShippingDetailsModal from "../components/cart/ShippingDetailsModal";
import { setShippingDetails } from "../redux/slices/shippingSlice";
import type { ShippingDetails } from "../types/checkout";
import Navbar from "../components/common/Navbar";

const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { shippingDetails } = useAppSelector((state) => state.shipping);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showShippingDetailsModal, setShowShippingDetailsModal] =
    useState(false);
  const [modalMode, setModalMode] = useState<"selection" | "form">("selection");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const addresses = user.shippingAddresses ?? [];

    if (!shippingDetails?.postalCode && addresses.length > 0) {
      const firstAddress = addresses[0];
      const detailsToUse: ShippingDetails = {
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
  }, [user, shippingDetails?.postalCode, dispatch]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logoutAndReset());
    navigate("/login");
  };

  const handleShippingDetailsSubmit = async (details: ShippingDetails) => {
    dispatch(setShippingDetails(details));
    setShowShippingDetailsModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <div className="grow container mx-auto p-4 md:p-6 space-y-6">
          <div className="shadow-md rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 text-acloblue">
                  {user.name}
                </h1>
                <p className="text-lg text-gray-600">{user.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>

            <div className="flex justify-between items-center mt-6 mb-3">
              <h2 className="text-lg font-semibold text-acloblue">
                Shipping Details
              </h2>

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

            {shippingDetails?.postalCode ? (
              <div className="mb-2 p-4 bg-gray-50 rounded-lg">
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
              <div className="mb-2 p-4 bg-gray-50 rounded-lg flex items-center justify-between gap-4">
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
          </div>

          <div className="w-full">
            <MyOrdersPage />
          </div>
        </div>

        {showShippingDetailsModal && (
          <ShippingDetailsModal
            onClose={() => setShowShippingDetailsModal(false)}
            onSubmit={handleShippingDetailsSubmit}
            userEmail={user.email}
            isCalculating={false}
            initialMode={modalMode}
          />
        )}
      </div>
    </>
  );
};

export default Profile;
