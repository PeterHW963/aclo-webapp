import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useState } from "react";
import {
  fetchAllOrders,
  updateOrderStatus,
  generateShippingLabel,
  fetchAdminOrderDetails,
  updateAdminRemarks,
  updateTrackingLink,
} from "../../redux/slices/adminOrderSlice";
import type {
  OrdersCategory,
  CancelRequest,
  Order,
  OrderStatus,
} from "../../types/order";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { getStatusBadge } from "../../constants/orderStatus";
import ActionModal from "./ActionModal";
import type { PaymentProof } from "../../types/checkout";
import { FaEye } from "react-icons/fa6";
import OrderDetailsModal from "./OrderDetailsModal";
import TrackingModal from "./TrackingModal";
import ActionConfirmationModal from "./ActionConfirmationModal";
import RemarksModal from "./RemarksModal";

const OrderManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const {
    orders,
    loading,
    orderDetailsLoading,
    trackingLinkLoading,
    error,
    generatingLabelForOrder,
    orderDetails,
    totalPages,
  } = useAppSelector((state) => state.adminOrders);
  const [activeTab, setActiveTab] = useState<OrdersCategory>("pending_action");
  const [page, setPage] = useState(1);
  const limit = 25;

  const [paymentProofOpen, setPaymentProofOpen] = useState<boolean>(false);
  const [cancelRequestOpen, setCancelRequestOpen] = useState<boolean>(false);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState<boolean>(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState<boolean>(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState<boolean>(false);
  const [actionConfirmationModalOpen, setActionConfirmationModalOpen] =
    useState<boolean>(false);
  const [trackingAction, setTrackingAction] = useState<"add" | "edit">("add");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedPaymentProof, setSelectedPaymentProof] =
    useState<PaymentProof | null>(null);
  const [selectedCancelRequest, setSelectedCancelRequest] =
    useState<CancelRequest | null>(null);
  const [selectedOrderTrackingLink, setSelectedOrderTrackingLink] =
    useState<string>("");
  const [pendingAction, setPendingAction] = useState<{
    orderId: string;
    targetStatus: OrderStatus;
    title: string;
    message: string;
    onAfterConfirm?: () => void;
    customConfirm?: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders({ category: activeTab, page, limit }));
    }
  }, [dispatch, user, activeTab, navigate, page]);

  const handleGenerateLabel = (order: Order) => {
    dispatch(generateShippingLabel({ id: order._id, orderId: order.orderId }));
  };

  const handleOpenOrderDetails = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setOrderDetailsOpen(true);
    dispatch(fetchAdminOrderDetails({ id: orderId }));
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrderId(null);
  };

  const handleOpenPaymentProof = (order: Order) => {
    if (!order.paymentProof) return; // guard clause

    setSelectedPaymentProof(order.paymentProof);
    setSelectedOrderId(order._id);
    setPaymentProofOpen(true);
  };

  const handleClosePaymentProof = () => {
    setPaymentProofOpen(false);
    setSelectedPaymentProof(null);
    setSelectedOrderId(null);
  };

  const handleOpenCancelRequest = (order: Order) => {
    if (!order.cancelRequest) return; // guard clause

    setSelectedCancelRequest(order.cancelRequest);
    setSelectedOrderId(order._id);
    setCancelRequestOpen(true);
  };

  const handleCloseCancelRequest = () => {
    setCancelRequestOpen(false);
    setSelectedCancelRequest(null);
    setSelectedOrderId(null);
  };

  const handleOpenAddTracking = (order: Order) => {
    setTrackingAction("add");
    setSelectedOrderId(order._id);
    setSelectedOrderTrackingLink(""); // add starts blank
    setTrackingModalOpen(true);
  };

  const handleOpenEditTracking = (order: Order) => {
    setTrackingAction("edit");
    setSelectedOrderId(order._id);
    setSelectedOrderTrackingLink(order.trackingLink ?? ""); // edit prefilled
    setTrackingModalOpen(true);
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedOrderTrackingLink("");
    setSelectedOrderId(null);
  };

  const handleOpenRemarksModal = (order: Order) => {
    setRemarksModalOpen(true);
    setSelectedOrderId(order._id);
  };

  const handleCloseRemarksModal = () => {
    setSelectedOrderId(null);
    setRemarksModalOpen(false);
  };

  const handleOpenActionConfirmationModal = (
    orderId: string,
    targetStatus: OrderStatus,
    title: string,
    message: string,
    onAfterConfirm?: () => void,
    customConfirm?: () => Promise<void>
  ) => {
    setPendingAction({
      orderId,
      targetStatus,
      title,
      message,
      onAfterConfirm,
      customConfirm,
    });
    setActionConfirmationModalOpen(true);
  };

  const handleCloseActionConfirmation = () => {
    setActionConfirmationModalOpen(false);
    setPendingAction(null);
  };

  const handleConfirmActionConfirmation = async () => {
    if (!pendingAction) return;
    if (pendingAction.customConfirm) {
      await pendingAction.customConfirm();
    } else {
      await dispatch(
        updateOrderStatus({
          id: pendingAction.orderId,
          status: pendingAction.targetStatus,
        })
      ).unwrap();
    }
    pendingAction.onAfterConfirm?.();
    handleCloseActionConfirmation();

    dispatch(fetchAllOrders({ category: activeTab, page, limit }));
  };

  const renderActionButtons = (order: Order) => {
    // create a common button style
    const baseBtn =
      "px-4 py-2 rounded-md flex items-center text-sm font-medium cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed";
    const actionBtn = {
      // primary: "bg-indigo-600 text-white hover:bg-indigo-500",
      primary: "bg-sky-600 text-white hover:bg-sky-500",
      success: "bg-emerald-600 text-white hover:bg-emerald-500",
      milestone: "bg-teal-600 text-white hover:bg-teal-500",
      warning: "bg-amber-500 text-white hover:bg-amber-400",
      dangerOutline:
        "bg-white text-rose-700 border-2 border-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 hover:border-rose-700 hover:ring-rose-300",
      infoOutline:
        "bg-white text-blue-700 border-2 border-blue-600 ring-1 ring-blue-200 hover:bg-blue-50 hover:border-blue-700 hover:ring-blue-300",
      neutralOutline:
        "bg-white text-slate-700 border-2 border-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 hover:border-slate-700 hover:ring-slate-300",
      neutral: "bg-slate-200 text-slate-700 hover:bg-slate-300",
    };

    switch (order.status) {
      case "pending":
        return (
          <>
            <button
              onClick={() => handleOpenPaymentProof(order)}
              className={`${baseBtn} ${actionBtn.warning}`}
            >
              Payment Proof
            </button>
          </>
        );
      case "rejected":
        return (
          <>
            <button
              onClick={() => {
                handleOpenActionConfirmationModal(
                  order._id,
                  "pending",
                  "Mark as Pending",
                  `Are you sure you want to mark this order as **Pending**?`
                );
              }}
              className={`${baseBtn} ${actionBtn.neutralOutline}`}
            >
              Mark as Pending
            </button>
          </>
        );
      case "processing":
        return (
          <>
            <button
              onClick={() => handleGenerateLabel(order)}
              disabled={generatingLabelForOrder === order._id}
              className={`${baseBtn} ${actionBtn.infoOutline}`}
            >
              {generatingLabelForOrder === order._id ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                "Generate Label"
              )}
            </button>
            <button
              onClick={() => handleOpenAddTracking(order)}
              className={`${baseBtn} ${actionBtn.milestone}`}
            >
              Add Tracking Link
            </button>
          </>
        );
      case "shipping":
        return (
          <>
            <button
              onClick={() => {
                handleOpenActionConfirmationModal(
                  order._id,
                  "delivered",
                  "Mark as Delivered",
                  `Are you sure you want to mark this order as **Delivered**?\nThe user will be notified that the order has arrived.`
                );
              }}
              className={`${baseBtn} ${actionBtn.success}`}
            >
              Mark as Delivered
            </button>
            <button
              onClick={() => handleOpenEditTracking(order)}
              className={`${baseBtn} ${actionBtn.primary}`}
            >
              Edit Tracking Link
            </button>
          </>
        );
      case "delivered":
        return (
          <>
            <button
              onClick={() => {
                handleOpenActionConfirmationModal(
                  order._id,
                  "returned",
                  "Mark as Returned",
                  `Are you sure you want to mark this order as **Returned**?`,
                  () => handleOpenRemarksModal(order)
                );
              }}
              className={`${baseBtn} ${actionBtn.neutralOutline}`}
            >
              Mark as Returned
            </button>
            <button
              onClick={() => {
                handleOpenActionConfirmationModal(
                  order._id,
                  "refunded",
                  "Mark as Refunded",
                  `Are you sure you want to mark this order as **Refunded**?`,
                  () => handleOpenRemarksModal(order)
                );
              }}
              className={`${baseBtn} ${actionBtn.dangerOutline}`}
            >
              Mark as Refunded
            </button>
            <button
              onClick={() => {
                handleOpenActionConfirmationModal(
                  order._id,
                  "exchanged",
                  "Mark as Exchanged",
                  `Are you sure you want to mark this order as **Exchanged**?`,
                  () => handleOpenRemarksModal(order)
                );
              }}
              className={`${baseBtn} ${actionBtn.infoOutline}`}
            >
              Mark as Exchanged
            </button>
          </>
        );
      case "cancelling":
        return (
          <>
            <button
              onClick={() => handleOpenCancelRequest(order)}
              className={`${baseBtn} ${actionBtn.warning}`}
            >
              Cancellation Request
            </button>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div className="max-w-8xl mx-auto p-6">
      {selectedPaymentProof && paymentProofOpen && selectedOrderId && (
        <ActionModal
          onClose={handleClosePaymentProof}
          type="paymentProof"
          data={selectedPaymentProof}
          onAccept={() =>
            handleOpenActionConfirmationModal(
              selectedOrderId,
              "processing",
              "Accept Payment Proof",
              `Are you sure you want to accept this payment proof?\nThis will mark the order as **Processing**.`,
              handleClosePaymentProof
            )
          }
          onReject={() =>
            handleOpenActionConfirmationModal(
              selectedOrderId,
              "rejected",
              "Reject Payment Proof",
              `Are you sure you want to reject this payment proof?\nThis will mark the order as **Rejected**.`,
              handleClosePaymentProof
            )
          }
          loading={loading}
        />
      )}
      {selectedCancelRequest && cancelRequestOpen && selectedOrderId && (
        <ActionModal
          onClose={handleCloseCancelRequest}
          type="cancelRequest"
          data={selectedCancelRequest}
          onAccept={() =>
            handleOpenActionConfirmationModal(
              selectedOrderId,
              "cancelled",
              "Accept Cancel Request",
              `Are you sure you want to accept this cancel request?\nThis will mark the order as **Cancelled**.`,
              handleCloseCancelRequest
            )
          }
          onReject={() =>
            handleOpenActionConfirmationModal(
              selectedOrderId,
              "pending",
              "Reject Cancel Request",
              `Are you sure you want to reject this cancel request?\nThis will revert the order status to **Pending**.`,
              handleCloseCancelRequest
            )
          }
          loading={loading}
        />
      )}
      {orderDetails && orderDetailsOpen && (
        <OrderDetailsModal
          onClose={handleCloseOrderDetails}
          orderDetails={orderDetails}
          loading={orderDetailsLoading}
          onSaveAdminRemarks={async (orderId, adminRemarks) => {
            await dispatch(
              updateAdminRemarks({ id: orderId, adminRemarks })
            ).unwrap();
          }}
        />
      )}
      {trackingModalOpen && selectedOrderId && (
        <TrackingModal
          action={trackingAction}
          initialValue={selectedOrderTrackingLink}
          onClose={handleCloseTrackingModal}
          onCancel={handleCloseTrackingModal}
          loading={trackingLinkLoading}
          onSave={(trackingLink) => {
            const message =
              trackingAction === "add"
                ? `Are you sure you want to save this tracking link?\nThis will mark the order as **Shipping**.`
                : `Are you sure you want to save this tracking link?\nUser will be notified of the updated tracking link`;
            handleOpenActionConfirmationModal(
              selectedOrderId,
              "shipping",
              "Save Tracking Link",
              message,
              handleCloseTrackingModal, // after confirm cleanup
              async () => {
                // custom confirm logic
                await dispatch(
                  updateTrackingLink({ id: selectedOrderId, trackingLink })
                ).unwrap();
                await dispatch(
                  updateOrderStatus({
                    id: selectedOrderId,
                    status: "shipping",
                  })
                ).unwrap();
              }
            );
          }}
        />
      )}
      {remarksModalOpen && selectedOrderId && (
        <RemarksModal
          orderId={selectedOrderId}
          onClose={handleCloseRemarksModal}
          onSave={async (adminRemarks) => {
            await dispatch(
              updateAdminRemarks({
                id: selectedOrderId,
                adminRemarks: adminRemarks,
              })
            ).unwrap();
            handleCloseRemarksModal();
            dispatch(fetchAllOrders({ category: activeTab, page, limit }));
          }}
        />
      )}
      {actionConfirmationModalOpen && pendingAction && (
        <ActionConfirmationModal
          onClose={handleCloseActionConfirmation}
          onConfirm={handleConfirmActionConfirmation}
          title={pendingAction.title}
          message={pendingAction.message}
          loading={loading}
        />
      )}

      <h2 className="text-2xl font-bold mb-8">Order Management</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["pending_action", "Pending Action"],
            ["ongoing", "Ongoing"],
            ["resolved", "Resolved"],
            ["failed", "Failed"],
            ["all", "All Orders"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition
        ${
          activeTab === key
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
        }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Created At</th>
              <th className="py-3 px-4">Total Price (IDR)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order.orderId}
                  </td>
                  <td className="p-4">
                    {typeof order.user === "string"
                      ? order.user
                      : order.user.name}
                  </td>
                  <td className="p-4">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {order.totalPrice.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start mt-4 sm:mt-0">
                      {(() => {
                        const badge = getStatusBadge(order.status);
                        return (
                          <span
                            className={`${badge.className} inline-flex items-center rounded-full px-2 py-1 text-xs sm:text-sm font-medium`}
                          >
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {renderActionButtons(order)}
                      {/* Details button */}
                      <button
                        type="button"
                        onClick={() => handleOpenOrderDetails(order._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded hover:bg-gray-100 cursor-pointer ml-auto"
                        title="View details"
                      >
                        <FaEye className="h-6 w-6" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No Orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          disabled={loading || page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-slate-600">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={loading || page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderManagement;
