import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect } from "react";
import {
  fetchAllOrders,
  updateOrderStatus,
  generateShippingLabel,
} from "../../redux/slices/adminOrderSlice";
import type { Order } from "../../types/order";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const OrderManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { orders, loading, error, generatingLabelForOrder } = useAppSelector(
    (state) => state.adminOrders
  );

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      dispatch(fetchAllOrders());
    }
  }, [dispatch, user, navigate]);

  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    dispatch(updateOrderStatus({ id: orderId, status }));
  };

  const handleGenerateLabel = (orderId: string) => {
    dispatch(generateShippingLabel(orderId));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total Price (IDR)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                    #{order.orderId}
                  </td>
                  <td className="p-4">
                    {typeof order.user === "string"
                      ? order.user
                      : order.user.name}
                  </td>
                  <td className="p-4">{order.totalPrice.toLocaleString()}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        handleStatusChange(
                          order.orderId,
                          e.target.value as Order["status"]
                        );
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(order.orderId, "delivered")
                        }
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Mark as Delivered
                      </button>
                      <button
                        onClick={() => handleGenerateLabel(order.orderId)}
                        disabled={generatingLabelForOrder === order.orderId}
                        className={`px-4 py-2 rounded flex items-center ${
                          generatingLabelForOrder === order.orderId
                            ? "bg-blue-500/50 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {generatingLabelForOrder === order.orderId ? (
                          <>
                            <AiOutlineLoading3Quarters className="animate-spin mr-2 h-4 w-4" />
                            Generating...
                          </>
                        ) : (
                          "Generate Label"
                        )}
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
    </div>
  );
};

export default OrderManagement;
