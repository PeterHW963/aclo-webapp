import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  Checkout,
  FetchCheckoutsParams,
  FetchCheckoutsResponse,
} from "../../types/checkout";
import type { AppError } from "../../types/error";
import axios, { AxiosError } from "axios";
import { API_URL, getAuthHeader } from "../../constants/api";

interface AdminCheckoutState {
  checkouts: Checkout[];
  totalValidCheckouts: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  checkoutDetails: Checkout | null;
  checkoutDetailsLoading: boolean;
}

const initialState: AdminCheckoutState = {
  checkouts: [],
  totalValidCheckouts: 0,
  page: 1,
  limit: 25,
  totalPages: 1,
  loading: false,
  error: null,
  checkoutDetails: null,
  checkoutDetailsLoading: false,
};

// async thunk to fetch all valid checkouts (admin only)
export const fetchValidCheckouts = createAsyncThunk<
  FetchCheckoutsResponse,
  FetchCheckoutsParams | void,
  { rejectValue: AppError }
>("adminCheckouts/fetchValidCheckouts", async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 25 } = (params ?? {}) as FetchCheckoutsParams;
    const response = await axios.get<FetchCheckoutsResponse>(
      `${API_URL}/api/admin/checkouts/valid-checkouts`,
      {
        headers: getAuthHeader(),
        params: {
          page,
          limit,
        },
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch checkouts admin" });
  }
});

// TODO: check on how to differentiate between the admin and normal user routes
export const fetchAdminCheckoutById = createAsyncThunk<
  Checkout,
  { checkoutId: string },
  { rejectValue: AppError }
>(
  "adminCheckouts/fetchAdminCheckoutById",
  async ({ checkoutId }, { rejectWithValue }) => {
    try {
      const res = await axios.get<Checkout>(
        `${API_URL}/api/admin/checkouts/${checkoutId}`,
        { headers: getAuthHeader() }
      );
      return res.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response?.data) return rejectWithValue(error.response.data);
      return rejectWithValue({
        message: "Failed to fetch admin checkout details",
      });
    }
  }
);

const adminCheckoutSlice = createSlice({
  name: "adminCheckouts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch checkouts
      .addCase(fetchValidCheckouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchValidCheckouts.fulfilled,
        (state, action: PayloadAction<FetchCheckoutsResponse>) => {
          const checkouts = action.payload.checkouts ?? [];

          state.checkouts = checkouts;
          state.totalValidCheckouts = action.payload.total ?? checkouts.length;
          state.page = action.payload.page ?? 1;
          state.limit = action.payload.limit ?? 25;
          state.totalPages = action.payload.totalPages ?? 1;
          state.loading = false;
        }
      )
      // fetch checkout details
      .addCase(fetchValidCheckouts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch checkouts admin";
      })
      .addCase(fetchAdminCheckoutById.pending, (state) => {
        state.checkoutDetailsLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminCheckoutById.fulfilled,
        (state, action: PayloadAction<Checkout>) => {
          state.checkoutDetailsLoading = false;
          state.checkoutDetails = action.payload;
        }
      )
      .addCase(fetchAdminCheckoutById.rejected, (state, action) => {
        state.checkoutDetailsLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch admin checkout details";
      });
  },
});

export default adminCheckoutSlice.reducer;
