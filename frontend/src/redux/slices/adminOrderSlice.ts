import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { API_URL, getAuthHeader } from "../../constants/api";
import type { Order } from "../../types/order";
import type { AppError } from "../../types/error";

interface AdminOrderState {
  orders: Order[];
  totalOrders: number;
  totalSales: number;
  loading: boolean;
  error: string | null;
  generatingLabelForOrder: string | null;
}

const initialState: AdminOrderState = {
  orders: [],
  totalOrders: 0,
  totalSales: 0,
  loading: false,
  error: null,
  generatingLabelForOrder: null,
};

// async thunk to fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: AppError }
>("adminOrders/fetchAllOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Order[]>(`${API_URL}/api/admin/orders`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch orders admin" });
  }
});

// async thunk to update order delivery status (admin only)
export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: Order["status"] },
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
  string,
  { rejectValue: AppError }
>("adminOrders/generateShippingLabel", async (id, { rejectWithValue }) => {
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
    link.download = `shipping-label-${id}.pdf`;
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
});

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
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.orders = action.payload;
          state.totalOrders = action.payload.length;

          // calculate total sales
          const totalSales = action.payload.reduce((acc, order) => {
            return acc + order.totalPrice;
          }, 0);
          state.totalSales = totalSales;
        }
      )
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders admin";
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
            (order) => order.orderId === updatedOrder.orderId
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
            (order) => order.orderId !== deletedId
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
        state.generatingLabelForOrder = action.meta.arg;
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
