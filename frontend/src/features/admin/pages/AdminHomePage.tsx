import { Link } from "react-router-dom";
import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAdminProducts } from "../slices/adminProductSlice";
import { fetchAllOrders } from "../slices/adminOrderSlice";

import useMediaQuery from "@mui/material/useMediaQuery";
import { getStatusBadge } from "../../../shared/constants/orderStatus";

const AdminHomePage = () => {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useAppSelector((state) => state.adminProducts);

  const {
    orders,
    totalOrders,
    totalSales,
    loading: ordersLoading,
    error: ordersError,
  } = useAppSelector((state) => state.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const loading = productsLoading || ordersLoading;
  const error = productsError || ordersError;

  const MobileRecentOrderCard = ({
    order,
  }: {
    order: (typeof orders)[number];
  }) => {
    const badge = getStatusBadge(order.status);

    return (
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-semibold text-gray-900">#{order.orderId}</p>

            <p className="mt-2 text-xs text-gray-500">Customer</p>
            <p className="text-sm text-gray-900">
              {typeof order.user === "string" ? order.user : order.user.name}
            </p>
          </div>

          <span
            className={`${badge.className} inline-flex items-center rounded-full px-2 py-1 text-xs font-medium`}
          >
            {badge.label}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : ""}
          </p>

          <p className="text-sm font-semibold text-acloblue">
            IDR {order.totalPrice.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <p>Loading ...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold">Revenue</h2>
            <p className="text-2xl">IDR {totalSales.toLocaleString()}</p>
          </div>

          <div className="p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold">Total Orders</h2>
            <p className="text-2xl">{totalOrders}</p>
            <Link to="/admin/orders" className="text-blue-500 hover:underline">
              Manage Orders
            </Link>
          </div>

          <div className="p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold">Total Products</h2>
            <p className="text-2xl">{products.length}</p>
            <Link
              to="/admin/products"
              className="text-blue-500 hover:underline"
            >
              Manage Products
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>

        {loading ? (
          <p>Loading ...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : isMobile ? (
          <div className="space-y-3">
            {orders.length > 0 ? (
              orders.map((order) => (
                <MobileRecentOrderCard key={order._id} order={order} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-6">
                No recent orders found
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-500">
              <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Total Price</th>
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
                        className="border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="p-4">{order.orderId}</td>
                        <td className="p-4">
                          {typeof order.user === "string"
                            ? order.user
                            : order.user.name}
                        </td>
                        <td className="p-4">
                          {order.totalPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4">
                          <span
                            className={`${badge.className} inline-flex items-center rounded-full px-2 py-1 text-xs font-medium`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3">
          <Link
            to="/admin/orders"
            className="text-blue-500 hover:underline font-medium"
          >
            Go to Order Management →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
