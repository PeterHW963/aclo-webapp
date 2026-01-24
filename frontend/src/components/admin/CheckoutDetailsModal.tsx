import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import type { Checkout } from "../../types/checkout";

interface CheckoutDetailsModalProps {
  onClose: () => void;
  checkoutDetails: Checkout | null;
  loading: boolean;
}

const CheckoutDetailsModal = ({
  onClose,
  checkoutDetails,
  loading,
}: CheckoutDetailsModalProps) => {
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
          Checkout Details
        </h2>

        {loading ? (
          <div className="p-6 rounded-lg border bg-gray-50 text-gray-700">
            Loading Checkout Details...
          </div>
        ) : !checkoutDetails ? (
          <p>No Checkout details found</p>
        ) : (
          <div className="p-4 sm:p-6 rounded-lg border">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  ID: #{checkoutDetails._id}
                </h3>
                <p className="text-gray-600">
                  Created:{" "}
                  {new Date(checkoutDetails.createdAt).toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Expires:{" "}
                  {new Date(checkoutDetails.expiresAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* User + Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-2">User</h4>
                <p>
                  Name:{" "}
                  {typeof checkoutDetails.user === "string"
                    ? checkoutDetails.user
                    : checkoutDetails.user.name}
                </p>
                <p>
                  Email:{" "}
                  {typeof checkoutDetails.user === "string"
                    ? checkoutDetails.user
                    : checkoutDetails.user.email}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Shipping Details</h4>
                <p>Name: {checkoutDetails.shippingDetails.name}</p>
                <p>Phone: {checkoutDetails.shippingDetails.phone}</p>
                <p>
                  Address:{" "}
                  {`${checkoutDetails.shippingDetails.address}, ${checkoutDetails.shippingDetails.city}, ${checkoutDetails.shippingDetails.postalCode}`}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="overflow-x-auto">
              <h4 className="text-lg font-semibold mb-4">Checkout Items</h4>
              <table className="min-w-full text-gray-600 mb-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Item</th>
                    <th className="py-2 px-4 text-center">Unit Price</th>
                    <th className="py-2 px-4 text-center">Qty</th>
                    <th className="py-2 px-4 text-center">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {checkoutDetails.checkoutItems.map((item) => {
                    return (
                      <tr
                        key={item.productVariantId}
                        className="border-b align-top"
                      >
                        <td className="py-2 px-4">
                          <div className="flex items-start gap-4">
                            <img
                              src={cloudinaryImageUrl(item.image)}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />

                            <div className="min-w-0">
                              <Link
                                to={`/product/${item.productId}`}
                                className="text-acloblue hover:underline font-medium"
                              >
                                {item.name}
                              </Link>

                              <div className="text-xs text-gray-400 mt-1">
                                Variant: {item.productVariantId}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-4 text-center">
                          IDR {item.price.toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-4 text-center">
                          IDR{" "}
                          {(item.price * item.quantity).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Cost excluding shipping */}
              <div className="mt-4 flex justify-end">
                <div className="text-right text-sm text-gray-700">
                  <div className="font-semibold">
                    Total: IDR{" "}
                    {(
                      checkoutDetails.totalPrice -
                      (checkoutDetails.shippingCost ?? 0)
                    ).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutDetailsModal;
