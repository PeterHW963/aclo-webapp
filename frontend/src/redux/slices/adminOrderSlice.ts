import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { API_URL, getAuthHeader } from "../../constants/api";
import type {
  FetchOrdersResponse,
  FetchOrdersParams,
  Order,
  OrderStatus,
} from "../../types/order";
import type { AppError } from "../../types/error";

interface AdminOrderState {
  orders: Order[];
  totalOrders: number;
  totalSales: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean; // for Order Management page
  orderDetailsLoading: boolean; // for Order Details modal
  trackingLinkLoading: boolean; // for Tracking Link modal
  error: string | null;
  generatingLabelForOrder: string | null;
  orderDetails: Order | null;
}

const initialState: AdminOrderState = {
  orders: [],
  totalOrders: 0,
  totalSales: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
  loading: false,
  orderDetailsLoading: false,
  trackingLinkLoading: false,
  error: null,
  generatingLabelForOrder: null,
  orderDetails: null,
};

// async thunk to fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk<
  FetchOrdersResponse,
  FetchOrdersParams | void,
  { rejectValue: AppError }
>("adminOrders/fetchAllOrders", async (params, { rejectWithValue }) => {
  try {
    const {
      category = "all",
      status,
      page = 1,
      limit = 25,
    } = (params ?? {}) as FetchOrdersParams;
    const statusParam = Array.isArray(status) ? status.join(",") : status;
    const response = await axios.get<FetchOrdersResponse>(
      `${API_URL}/api/admin/orders`,
      {
        headers: getAuthHeader(),
        params: {
          category,
          page,
          limit,
          ...(statusParam ? { status: statusParam } : {}),
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch orders admin" });
  }
});

// async thunk to fetch order details by ID (admin only)
export const fetchAdminOrderDetails = createAsyncThunk<
  Order,
  { id: string },
  { rejectValue: AppError }
>("adminOrders/fetchAdminOrderDetails", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await axios.get<Order>(
      `${API_URL}/api/admin/orders/${id}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch admin order details" });
  }
});

// async thunk to update admin remarks (admin only)
export const updateAdminRemarks = createAsyncThunk<
  Order,
  { id: string; adminRemarks: string },
  { rejectValue: AppError }
>(
  "adminOrders/updateAdminRemarks",
  async ({ id, adminRemarks }, { rejectWithValue }) => {
    try {
      const response = await axios.put<Order>(
        `${API_URL}/api/admin/orders/${id}/remarks`,
        { adminRemarks },
        { headers: getAuthHeader() }
      );
      return response.data; // updated order
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update admin remarks" });
    }
  }
);

// async thunk to update order trackingLink (admin only)
export const updateTrackingLink = createAsyncThunk<
  Order,
  { id: string; trackingLink: string },
  { rejectValue: AppError }
>(
  "adminOrders/updateTrackingLink",
  async ({ id, trackingLink }, { rejectWithValue }) => {
    try {
      const response = await axios.put<Order>(
        `${API_URL}/api/admin/orders/${id}/trackingLink`,
        { trackingLink },
        { headers: getAuthHeader() }
      );
      return response.data; // updated order
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update trackingId" });
    }
  }
);

// async thunk to update order delivery status (admin only)
export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: OrderStatus },
  { rejectValue: AppError }
>(
  "adminOrders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put<Order>(
        `${API_URL}/api/admin/orders/${id}`,
        { status },
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: "Failed to fetch update order status",
      });
    }
  }
);

// async thunk to delete an order (admin only)
export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: AppError }
>("adminOrders/deleteOrder", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/api/admin/orders/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to delete order" });
  }
});

// async thunk to generate shipping label PDF (admin only)
export const generateShippingLabel = createAsyncThunk<
  void,
  { id: string; orderId: string },
  { rejectValue: AppError }
>(
  "adminOrders/generateShippingLabel",
  async ({ id, orderId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/orders/${id}/shipping-label`,
        {
          headers: getAuthHeader(),
          responseType: "blob",
        }
      );

      // create blob and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `shipping-label-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to generate shipping label" });
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllOrders.fulfilled,
        (state, action: PayloadAction<FetchOrdersResponse>) => {
          const orders = action.payload.orders ?? [];

          state.orders = orders;
          state.totalOrders = action.payload.total ?? orders.length;
          state.page = action.payload.page ?? 1;
          state.limit = action.payload.limit ?? 25;
          state.totalPages = action.payload.totalPages ?? 1;

          state.totalSales = orders.reduce((acc, order) => {
            return acc + (order.totalPrice ?? 0);
          }, 0);

          state.loading = false;
        }
      )

      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders admin";
      })
      // fetch admin order details
      .addCase(fetchAdminOrderDetails.pending, (state) => {
        state.orderDetailsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminOrderDetails.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.orderDetailsLoading = false;
          state.orderDetails = action.payload;
        }
      )
      .addCase(fetchAdminOrderDetails.rejected, (state, action) => {
        state.orderDetailsLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch admin order details";
      })
      // update admin remarks
      .addCase(updateAdminRemarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateAdminRemarks.fulfilled,
        (state, action: PayloadAction<Order>) => {
          const updatedOrder = action.payload;
          // update the list
          const orderIndex = state.orders.findIndex(
            (o) => o._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex] = updatedOrder;
          }
          state.loading = false;
        }
      )
      .addCase(updateAdminRemarks.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update admin remarks";
      })
      // update order trackingId
      .addCase(updateTrackingLink.pending, (state) => {
        state.trackingLinkLoading = true;
        state.error = null;
      })
      .addCase(
        updateTrackingLink.fulfilled,
        (state, action: PayloadAction<Order>) => {
          const updatedOrder = action.payload;
          // update the list
          const orderIndex = state.orders.findIndex(
            (o) => o._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex] = updatedOrder;
          }
          state.trackingLinkLoading = false;
        }
      )
      .addCase(updateTrackingLink.rejected, (state, action) => {
        state.trackingLinkLoading = false;
        state.error =
          action.payload?.message || "Failed to update order tracking link";
      })
      // update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateOrderStatus.fulfilled,
        (state, action: PayloadAction<Order>) => {
          const updatedOrder = action.payload;
          const orderIndex = state.orders.findIndex(
            (order) => order._id === updatedOrder._id
          );
          if (orderIndex !== -1) {
            state.orders[orderIndex] = updatedOrder;
          }
          state.loading = false;
        }
      )
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update order status";
      })
      // delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteOrder.fulfilled,
        (state, action: PayloadAction<string>) => {
          const deletedId = action.payload;
          state.orders = state.orders.filter(
            (order) => order._id !== deletedId
          );
          state.totalOrders = state.orders.length;
          state.totalSales = state.orders.reduce(
            (acc, order) => acc + order.totalPrice,
            0
          );
          state.loading = false;
        }
      )
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete order";
      })
      // generate shipping label
      .addCase(generateShippingLabel.pending, (state, action) => {
        state.generatingLabelForOrder = action.meta.arg.id;
        state.error = null;
      })
      .addCase(generateShippingLabel.fulfilled, (state) => {
        state.generatingLabelForOrder = null;
      })
      .addCase(generateShippingLabel.rejected, (state, action) => {
        state.generatingLabelForOrder = null;
        state.error =
          action.payload?.message || "Failed to generate shipping label";
      });
  },
});

export default adminOrderSlice.reducer;
