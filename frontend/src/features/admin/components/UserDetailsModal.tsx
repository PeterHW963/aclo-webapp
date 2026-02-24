import { useEffect } from "react";

import type { User, ShippingAddress } from "../../../shared/types/user";
import type { Order } from "../../../shared/types/order";

import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";
import { getStatusBadge } from "../../../shared/constants/orderStatus";

type UserDetailsModalProps = {
  user: User;
  orders: Order[];
  onClose: () => void;
  loading: boolean;
  error: string | null;
};

const getPrimaryShipping = (user: User): ShippingAddress | null => {
  const addresses = user.shippingAddresses ?? [];
  return addresses.length > 0 ? addresses[0] : null;
};

const UserDetailsModal = ({
  user,
  orders,
  onClose,
  loading,
  error,
}: UserDetailsModalProps) => {
  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const shipping = getPrimaryShipping(user);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-[min(96vw,72rem)] max-h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col min-h-0"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded hover:bg-gray-200 hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          {/* Profile-like section (fixed) */}
          <div className="shadow-md rounded-lg p-6 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 text-acloblue">
                  {user.name}
                </h1>
                <p className="text-lg text-gray-600">{user.email}</p>
              </div>

              <div className="text-md text-gray-600">
                Role: <span className="font-semibold">{user.role}</span>
              </div>
            </div>

            {/* Shipping Details (no edit button) */}
            <div className="flex justify-between items-center mt-6 mb-3">
              <h2 className="text-lg font-semibold text-ink">
                Shipping Details
              </h2>
            </div>

            {shipping ? (
              <div className="mb-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-800">{shipping.name}</p>
                <p className="text-sm text-gray-600">
                  {shipping.addressDetails}
                </p>
                <p className="text-sm text-gray-600">
                  {shipping.city}, {shipping.postalCode}
                </p>
                <p className="text-sm text-gray-600">{shipping.phone}</p>
              </div>
            ) : (
              <div className="mb-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  No shipping details yet.
                </p>
              </div>
            )}
          </div>

          {/* Orders section (takes remaining space) */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-acloblue shrink-0">
              Orders
            </h2>

            <div className="flex-1 min-h-0 overflow-hidden">
              <div className="h-full overflow-y-auto pr-1">
                {/* Mobile cards */}
                <div className="space-y-3 sm:hidden">
                  {orders.length > 0 ? (
                    orders.map((order) => {
                      const badge = getStatusBadge(order.status);

                      return (
                        <div
                          key={order._id}
                          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={cloudinaryImageUrl(
                                order.orderItems[0].image,
                              )}
                              alt={order.orderItems[0].name}
                              className="w-14 h-14 object-cover rounded-lg shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-gray-900 truncate">
                                  #{order.orderId}
                                </p>
                                <span
                                  className={`${badge.className} inline-flex items-center rounded-full px-2 py-1 text-xs font-medium`}
                                >
                                  {badge.label}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleString()}
                              </p>

                              <div className="mt-2 text-sm text-gray-700 space-y-1">
                                <p>
                                  <span className="text-gray-500">Items:</span>{" "}
                                  {order.orderItems.length}
                                </p>
                                <p>
                                  <span className="text-gray-500">Total:</span>{" "}
                                  <span className="font-semibold text-gray-900">
                                    IDR {order.totalPrice.toLocaleString()}
                                  </span>
                                </p>

                                <p className="text-gray-600 line-clamp-2">
                                  <span className="text-gray-500">
                                    Ship to:
                                  </span>{" "}
                                  {order.shippingDetails
                                    ? `${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}`
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      This user has no orders
                    </div>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block relative shadow-md sm:rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-gray-500">
                      <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                          <th className="py-3 px-4">Image</th>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Created</th>
                          <th className="py-3 px-4">Shipping Address</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Price</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orders.length > 0 ? (
                          orders.map((order) => {
                            const badge = getStatusBadge(order.status);

                            return (
                              <tr
                                key={order._id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-4 px-4">
                                  <img
                                    src={cloudinaryImageUrl(
                                      order.orderItems[0].image,
                                    )}
                                    alt={order.orderItems[0].name}
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                </td>

                                <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                                  #{order.orderId}
                                </td>

                                <td className="py-4 px-4">
                                  {new Date(order.createdAt).toLocaleString()}
                                </td>

                                <td className="py-4 px-4">
                                  {order.shippingDetails
                                    ? `${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}`
                                    : "N/A"}
                                </td>

                                <td className="py-4 px-4">
                                  {order.orderItems.length}
                                </td>

                                <td className="py-4 px-4">
                                  IDR {order.totalPrice.toLocaleString()}
                                </td>

                                <td className="py-4 px-4">
                                  <span
                                    className={`${badge.className} inline-flex items-center rounded-full px-2 py-1 text-xs sm:text-sm font-medium`}
                                  >
                                    {badge.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-6 px-4 text-center text-gray-500"
                            >
                              This user has no orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-900 text-white hover:opacity-90 hover:cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
