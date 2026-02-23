import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

import type {
  Checkout,
  CreateCheckoutPayload,
} from "../../../shared/types/checkout";
import type { AppError } from "../../../shared/types/error";

import { API_URL, getAuthHeader } from "../../../shared/constants/api";

interface CheckoutState {
  checkout: Checkout | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  checkout: null,
  loading: false,
  error: null,
};

// Async thunk to fetch checkout by Id
export const fetchCheckoutById = createAsyncThunk<
  Checkout,
  { checkoutId: string },
  { rejectValue: AppError }
>("checkout/fetchCheckoutById", async ({ checkoutId }, { rejectWithValue }) => {
  try {
    const res = await axios.get<Checkout>(
      `${API_URL}/api/checkout/${checkoutId}`,
      {
        headers: getAuthHeader(),
      },
    );
    return res.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch checkout" });
  }
});

// Async thunk to fetch the current user's active checkout
export const fetchActiveUserCheckout = createAsyncThunk<
  Checkout,
  void,
  { rejectValue: AppError }
>("checkout/fetchActiveUserCheckout", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<Checkout>(`${API_URL}/api/checkout`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch active checkout" });
  }
});

// Async thunk to create a checkout session
export const createCheckout = createAsyncThunk<
  Checkout,
  CreateCheckoutPayload,
  { rejectValue: AppError }
>("checkout/createCheckout", async (checkoutData, { rejectWithValue }) => {
  try {
    const response = await axios.post<Checkout>(
      `${API_URL}/api/checkout`,
      checkoutData,
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to create checkout" });
  }
});

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckoutById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCheckoutById.fulfilled,
        (state, action: PayloadAction<Checkout>) => {
          state.loading = false;
          state.checkout = action.payload;
        },
      )
      .addCase(fetchCheckoutById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch checkout";
      })
      .addCase(fetchActiveUserCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveUserCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
      })
      .addCase(fetchActiveUserCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch active user checkout";
      })
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createCheckout.fulfilled,
        (state, action: PayloadAction<Checkout>) => {
          state.loading = false;
          state.checkout = action.payload;
        },
      )
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create checkout";
      });
  },
});

export default checkoutSlice.reducer;
