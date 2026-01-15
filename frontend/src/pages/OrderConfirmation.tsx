import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useEffect, useState } from "react";
import { cloudinaryImageUrl } from "../constants/cloudinary";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import LoadingOverlay from "../components/common/LoadingOverlay";
import Navbar from "../components/common/Navbar";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orderDetails, error } = useAppSelector((state) => state.orders);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!orderId) {
        navigate("/");
        return;
      }
      setLoading(true);
      try {
        // Fetch if missing OR wrong checkout currently in redux
        if (!orderDetails?.orderId || orderDetails.orderId !== orderId) {
          await dispatch(fetchOrderDetails({ orderId })).unwrap();
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) navigate("/my-orders");
        return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, orderDetails?._id, dispatch, navigate]);

  // clear the cart when order is confirmed
  useEffect(() => {
    console.log(orderDetails);
    if (!orderId) return;
    if (loading) return;

    if (!orderDetails || orderDetails.orderId !== orderId) {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, orderDetails?._id, loading, dispatch, navigate]);

  const calculateEstimatedDelivery = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    orderDate.setDate(orderDate.getDate() + 10);
    return orderDate.toLocaleDateString();
  };

  if (loading) return <LoadingOverlay show />;
  if (error) return <p>Error: {error}</p>;

  if (!orderDetails || orderDetails.orderId !== orderId) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-acloblue mb-4 uppercase tracking-tight">
          Order Received
        </h1>
        <div className="h-[2px] w-16 bg-acloblue/30 rounded-full mx-auto mb-8" />
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-3 w-3 rounded-full bg-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 uppercase tracking-wide">
                Pending Payment Verification
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Your order is{" "}
                <span className="font-semibold">not confirmed yet</span>. We’ll
                confirm it only after we verify and approve your payment proof.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex justify-between mb-10">
            {/* Order Id and Date */}
            <div>
              <h2 className="text-xl font-semibold">
                Order ID: {orderDetails.orderId}
              </h2>
              <p className="text-gray-500">
                Order date:{" "}
                {new Date(orderDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
            {/* Estimated Delivery */}
            <div>
              <p className="text-emerald-700 text-sm inline-flex items-center px-3 py-1 rounded-full bg-emerald-50">
                Estimated Delivery:{" "}
                {calculateEstimatedDelivery(orderDetails.createdAt)}
              </p>
            </div>
          </div>
          {/* Ordered Items */}
          <div className="mb-6">
            {orderDetails.orderItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center py-4 border-b border-gray-100 last:border-b-0"
              >
                <img
                  src={cloudinaryImageUrl(item.image)}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h4 className="text-md font-semibold">{item.name}</h4>
                  {item.options && Object.keys(item.options).length > 0 && (
                    <p className="text-sm text-gray-500">
                      {Object.entries(item.options)
                        .map(([key, value]) => {
                          const label =
                            key.charAt(0).toUpperCase() + key.slice(1);
                          const displayValue = String(value);
                          return `${label}: ${displayValue}`;
                        })
                        .join(" | ")}
                    </p>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <p className="text-md font-semibold text-acloblue">
                    IDR {Number(item.price).toLocaleString("en-US")}
                  </p>

                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-6 rounded-2xl border border-acloblue/10 bg-acloblue/5 p-5">
            <p className="text-sm font-semibold text-acloblue uppercase tracking-wide">
              What happens next
            </p>

            <ol className="mt-3 space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-acloblue/20 text-xs font-bold text-acloblue">
                  1
                </span>
                <p className="text-sm text-gray-700">
                  We review your payment proof.
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-acloblue/20 text-xs font-bold text-acloblue">
                  2
                </span>
                <p className="text-sm text-gray-700">
                  Once approved, your order is confirmed and we’ll notify you.
                </p>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white border border-acloblue/20 text-xs font-bold text-acloblue">
                  3
                </span>
                <p className="text-sm text-gray-700">
                  When your parcel is shipped, we’ll send your tracking number.
                </p>
              </li>
            </ol>
          </div>
          {/* Payment and Delivery Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-acloblue">
                Payment
              </h4>
              <p className="text-gray-600">Bank Transfer</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-acloblue">
                Delivery
              </h4>
              <p className="text-gray-600">
                {orderDetails.shippingDetails.address}
              </p>
              <p className="text-gray-600">
                {orderDetails.shippingDetails.city},{" "}
                {orderDetails.shippingDetails.postalCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;
