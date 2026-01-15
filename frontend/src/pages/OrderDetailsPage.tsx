import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { cloudinaryImageUrl } from "../constants/cloudinary";
import { getStatusBadge } from "../constants/orderStatus";
import Navbar from "../components/common/Navbar";
import LoadingOverlay from "../components/common/LoadingOverlay";

const OrderDetailsPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { orderDetails, error } = useAppSelector((state) => state.orders);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) {
        navigate("/my-orders");
        return;
      }

      setLoading(true);

      try {
        // fetch if missing OR wrong order currently in redux
        if (!orderDetails?.orderId || orderDetails.orderId !== id) {
          await dispatch(fetchOrderDetails({ orderId: id })).unwrap();
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        if (!cancelled) navigate("/my-orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [dispatch, id, orderDetails?._id, navigate]);

  if (error) return <p>Error: {error}</p>;
  return (
    <div>
      <Navbar />
      <LoadingOverlay show={loading} />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
        {!orderDetails ? (
          <p>No Order details found</p>
        ) : (
          <div className="p-4 sm:p-6 rounded-lg border">
            {/* Order Info */}
            <div className="flex flex-col sm:flex-row justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  Order ID: #{orderDetails.orderId}
                </h3>
                <p className="text-gray-600">
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
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
                <p>Payment Status: {orderDetails.paymentProof?.status}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Shipping Info</h4>
                {/* <p>Shipping Method: {orderDetails.shippingMethod}</p> */}
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
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Unit Price</th>
                    <th className="py-2 px-4">Quantity</th>
                    <th className="py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.orderItems.map((item) => (
                    <tr key={item.productVariantId} className="border-b">
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-6">
                          <img
                            src={cloudinaryImageUrl(item.image)}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-blue-500 hover:underline"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        IDR {item.price.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-center">{item.quantity}</td>
                      <td className="py-2 px-4 text-center">
                        IDR {(item.quantity * item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Note to Seller */}
            <div className="mb-6">
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
            {/* Back to Orders link */}
            <Link to="/my-orders" className="text-blue-500 hover:underline">
              Back to My Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
