import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import type { Order } from "../../types/order";
import { getStatusBadge } from "../../constants/orderStatus";
import { Link } from "react-router-dom";

interface OrderDetailsModalProps {
  onClose: () => void;
  orderDetails: Order | null;
  loading: boolean;
  onSaveAdminRemarks?: (orderId: string, adminRemarks: string) => Promise<void>;
}

const OrderDetailsModal = ({
  onClose,
  orderDetails,
  loading,
  onSaveAdminRemarks,
}: OrderDetailsModalProps) => {
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [remarksDraft, setRemarksDraft] = useState("");
  const [remarksSaved, setRemarksSaved] = useState(""); // what we revert to
  const [savingRemarks, setSavingRemarks] = useState(false);
  const [remarksError, setRemarksError] = useState<string>("");

  useEffect(() => {
    if (!orderDetails) return;
    if (isEditingRemarks || savingRemarks) return;
    const current = orderDetails?.adminRemarks ?? "";
    setRemarksDraft(current);
    setRemarksSaved(current);
    setRemarksError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderDetails?._id,
    orderDetails?.adminRemarks,
    isEditingRemarks,
    savingRemarks,
  ]);

  useEffect(() => {
    // reset state upon opening a new order's details
    setIsEditingRemarks(false);
    setRemarksError("");
  }, [orderDetails?._id]);

  const handleEditRemarks = () => {
    setRemarksError("");
    setIsEditingRemarks(true);
  };

  const handleCancelRemarks = () => {
    setRemarksDraft(remarksSaved);
    setIsEditingRemarks(false);
    setRemarksError("");
  };

  const handleSaveRemarks = async () => {
    if (!orderDetails?._id) return;

    try {
      setSavingRemarks(true);
      setRemarksError("");

      if (!onSaveAdminRemarks) {
        throw new Error("Missing onSaveAdminRemarks prop");
      }

      await onSaveAdminRemarks(orderDetails._id, remarksDraft);

      // commit locally after successful save
      setRemarksSaved(remarksDraft);
      setIsEditingRemarks(false);
    } catch (e: any) {
      setRemarksError(e?.message ?? "Failed to save admin remarks.");
    } finally {
      setSavingRemarks(false);
    }
  };

  const subtotal = Number(orderDetails?.subtotal);
  const discount = Number(orderDetails?.discount ?? 0);
  const shipping = Number(orderDetails?.shippingCost);
  const total = Number(orderDetails?.totalPrice);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-5xl rounded-xl bg-white p-6 shadow-lg border max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500"
          aria-label="Close"
        >
          <IoMdClose className="h-8 w-8 hover:text-gray-600 cursor-pointer" />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold mb-6 pt-2 pl-2">
          Order Details
        </h2>

        {loading ? (
          <div className="p-6 rounded-lg border bg-gray-50 text-gray-700">
            Loading Order Details...
          </div>
        ) : !orderDetails ? (
          <p>No Order details found</p>
        ) : (
          <div className="p-4 sm:p-6 rounded-lg border">
            {/* Order Info */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  ID: #{orderDetails._id}
                </h3>
                <p className="text-gray-600">
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                {(() => {
                  const badge = getStatusBadge(orderDetails.status);
                  return (
                    <span
                      className={`${badge.className} inline-flex items-center rounded-full px-2 py-1 text-xs sm:text-sm font-medium`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Customer, Payment, Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">Payment Info</h4>
                <p>Payment Method: {orderDetails.paymentMethod}</p>
                <p>
                  Payment Status: {orderDetails.paymentProof?.status ?? "-"}
                </p>

                {/* Payment Proof thumbnail + preview */}
                {orderDetails.paymentProof?.publicId && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Payment Proof
                    </div>
                    <div
                      onClick={() => setPreviewOpen(true)}
                      className="relative w-28 h-36 cursor-pointer group overflow-hidden rounded-lg border"
                      title="Click to preview"
                    >
                      <img
                        src={cloudinaryImageUrl(
                          orderDetails.paymentProof.publicId,
                        )}
                        alt="Payment proof"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {orderDetails.paymentProof.uploadedAt && (
                      <p className="text-xs text-gray-600 mt-2">
                        Uploaded:{" "}
                        {new Date(
                          orderDetails.paymentProof.uploadedAt,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Shipping Info</h4>
                <p>
                  Address:{" "}
                  {`${orderDetails.shippingDetails.address}, ${orderDetails.shippingDetails.city}, ${orderDetails.shippingDetails.postalCode}`}
                </p>
              </div>
            </div>

            {/* Product List */}
            <div className="overflow-x-auto">
              <h4 className="text-lg font-semibold mb-4">Products</h4>
              <table className="min-w-full text-gray-600 mb-8">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-center">Unit Price</th>
                    <th className="py-2 px-4 text-center">Quantity</th>
                    <th className="py-2 px-4 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.orderItems.map((item) => (
                    <tr key={item.productVariantId} className="border-b">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={cloudinaryImageUrl(item.image)}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-acloblue hover:underline"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        IDR {item.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-4 text-center">{item.quantity}</td>
                      <td className="py-2 px-4 text-center">
                        IDR{" "}
                        {(item.quantity * item.price).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Summary */}
            <div className="mb-2">
              <div className="flex justify-between items-center">
                <p className="text-gray-700">Subtotal</p>
                <p className="text-lg font-medium text-gray-900">
                  IDR {subtotal.toLocaleString("id-ID")}
                </p>
              </div>

              {discount !== 0 && (
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-700">Discount</p>
                  <p className="text-lg font-medium text-gray-900">
                    - IDR {Math.abs(discount).toLocaleString("id-ID")}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-700">Shipping</p>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    IDR {shipping.toLocaleString("id-ID")}
                  </p>
                  {(orderDetails?.shippingMethod ||
                    orderDetails?.shippingCourier) && (
                    <p className="text-xs text-gray-500">
                      {orderDetails.shippingCourier} •{" "}
                      {orderDetails.shippingMethod}{" "}
                      {orderDetails.shippingDuration
                        ? `(${orderDetails.shippingDuration})`
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-900">Total</p>
                <p className="text-2xl font-semibold text-acloblue">
                  IDR {total.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Note to Seller */}
            <div className="mb-6 border-l-4 border-blue-400 bg-blue-50 px-4 py-3 rounded">
              <h4 className="text-lg font-semibold mb-2">Note to Seller</h4>
              <div className="mt-2 bg-gray-50 px-4 py-3 rounded-lg min-h-16">
                {orderDetails.noteToSeller ? (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {orderDetails.noteToSeller}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">No note provided</p>
                )}
              </div>
            </div>

            {/* Proof Preview */}
            {previewOpen && orderDetails.paymentProof?.publicId && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                onClick={() => setPreviewOpen(false)}
              >
                <div className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="absolute -top-10 right-0 text-white text-sm px-4 py-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
                  >
                    Close
                  </button>

                  <img
                    src={cloudinaryImageUrl(orderDetails.paymentProof.publicId)}
                    alt="Payment proof preview"
                    className="w-full h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            {/* Admin Remarks */}
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h4 className="text-lg font-semibold">Admin Remarks</h4>

                {!isEditingRemarks ? (
                  <button
                    type="button"
                    onClick={handleEditRemarks}
                    className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelRemarks}
                      disabled={savingRemarks}
                      className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRemarks}
                      disabled={savingRemarks}
                      className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:bg-black/90 disabled:opacity-60"
                    >
                      {savingRemarks ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <textarea
                value={remarksDraft}
                onChange={(e) => setRemarksDraft(e.target.value)}
                disabled={!isEditingRemarks || savingRemarks}
                rows={5}
                className={`w-full rounded-lg border p-3 text-sm outline-none ${
                  !isEditingRemarks ? "bg-gray-50 text-gray-700" : "bg-white"
                }`}
                placeholder="Write internal admin remarks here..."
              />

              {remarksError && (
                <p className="mt-2 text-sm text-red-600">{remarksError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
