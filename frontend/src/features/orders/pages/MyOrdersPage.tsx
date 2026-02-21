import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchUserOrders, requestCancelOrder } from "../slices/orderSlice";

import { cloudinaryImageUrl } from "../../../shared/constants/cloudinary";
import { getStatusBadge } from "../../../shared/constants/orderStatus";

import LoadingOverlay from "../../../shared/components/common/LoadingOverlay";
import CancelModal from "../../profile/components/CancelModal";

const SELLER_WHATSAPP_E164 = "6282128528968";

const buildWhatsAppUrl = (orderId: string | number) => {
  const text = `Hi, I am contacting regarding order ID: ${orderId}`;
  return `https://wa.me/${SELLER_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
};

const MyOrdersPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, error } = useAppSelector((state) => state.orders);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        await dispatch(fetchUserOrders()).unwrap();
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const handleRowClick = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  if (error) return <p>Error: {error}</p>;

  const openCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setCancelOrderId(null);
  };

  return (
    <div>
      <LoadingOverlay show={loading} />

      {cancelModalOpen && cancelOrderId && (
        <CancelModal
          onClose={closeCancelModal}
          onSubmit={async (reason) => {
            await dispatch(
              requestCancelOrder({ id: cancelOrderId, reason }),
            ).unwrap();
            closeCancelModal();
          }}
        />
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-acloblue">
          My Orders
        </h2>

        <div className="space-y-3 sm:hidden">
          {orders.length > 0 ? (
            orders.map((order) => {
              const badge = getStatusBadge(order.status);

              return (
                <div
                  key={order._id}
                  onClick={() => handleRowClick(order._id)}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm active:opacity-80"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={cloudinaryImageUrl(order.orderItems[0].image)}
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
                        {new Date(order.createdAt).toLocaleDateString()}{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
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
                          <span className="text-gray-500">Ship to:</span>{" "}
                          {order.shippingDetails
                            ? `${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <a
                          href={buildWhatsAppUrl(order.orderId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`text-center rounded-md px-3 py-2 text-sm font-medium bg-acloblue text-white hover:opacity-90 ${
                            order.status === "pending" ? "flex-1" : "w-1/2"
                          }`}
                        >
                          Contact
                        </a>

                        {order.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancelModal(order._id);
                            }}
                            className="flex-1 rounded-md px-3 py-2 text-sm font-medium bg-rose-600 text-white hover:bg-rose-500"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-gray-500">
              You have no orders
            </div>
          )}
        </div>

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
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => {
                    const badge = getStatusBadge(order.status);

                    return (
                      <tr
                        key={order._id}
                        onClick={() => handleRowClick(order._id)}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <img
                            src={cloudinaryImageUrl(order.orderItems[0].image)}
                            alt={order.orderItems[0].name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </td>

                        <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                          #{order.orderId}
                        </td>

                        <td className="py-4 px-4">
                          {new Date(order.createdAt).toLocaleDateString()}{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </td>

                        <td className="py-4 px-4">
                          {order.shippingDetails
                            ? `${order.shippingDetails.address}, ${order.shippingDetails.city}, ${order.shippingDetails.postalCode}`
                            : "N/A"}
                        </td>

                        <td className="py-4 px-4">{order.orderItems.length}</td>

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

                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2 items-start">
                            <a
                              href={buildWhatsAppUrl(order.orderId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md px-3 py-1 text-xs sm:text-sm font-medium bg-acloblue text-white hover:opacity-90"
                            >
                              Contact
                            </a>

                            {order.status === "pending" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCancelModal(order._id);
                                }}
                                className="rounded-md px-3 py-1 text-xs sm:text-sm font-medium bg-rose-600 text-white hover:bg-rose-500"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      You have no orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
