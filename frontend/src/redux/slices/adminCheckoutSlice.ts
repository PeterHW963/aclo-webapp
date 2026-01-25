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
  validCheckouts: Checkout[];
  expiredCheckouts: Checkout[];
  totalValidCheckouts: number;
  totalExpiredCheckouts: number;
  validPage: number;
  expiredPage: number;
  limit: number;
  validTotalPages: number;
  expiredTotalPages: number;
  validLoading: boolean;
  expiredLoading: boolean;
  error: string | null;
  checkoutDetails: Checkout | null;
  checkoutDetailsLoading: boolean;
}

const initialState: AdminCheckoutState = {
  validCheckouts: [],
  expiredCheckouts: [],
  totalValidCheckouts: 0,
  totalExpiredCheckouts: 0,
  validPage: 1,
  expiredPage: 1,
  limit: 25,
  validTotalPages: 1,
  expiredTotalPages: 1,
  validLoading: false,
  expiredLoading: false,
  error: null,
  checkoutDetails: null,
  checkoutDetailsLoading: false,
};

// async thunk to fetch all valid checkouts (admin only)
export const fetchIncompleteCheckouts = createAsyncThunk<
  FetchCheckoutsResponse,
  FetchCheckoutsParams,
  { rejectValue: AppError }
>(
  "adminCheckouts/fetchIncompleteCheckouts",
  async (params, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 25,
        status = "valid",
      } = (params ?? {}) as FetchCheckoutsParams;
      const response = await axios.get<FetchCheckoutsResponse>(
        `${API_URL}/api/admin/checkouts/incomplete-checkouts`,
        {
          headers: getAuthHeader(),
          params: {
            page,
            limit,
            status,
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
  }
);

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
      .addCase(fetchIncompleteCheckouts.pending, (state, action) => {
        state.error = null;
        const status = action.meta.arg.status;
        if (status === "valid") state.validLoading = true;
        else state.expiredLoading = true;
      })
      .addCase(fetchIncompleteCheckouts.fulfilled, (state, action) => {
        const status = action.meta.arg.status;
        const checkouts = action.payload.checkouts ?? [];

        if (status === "valid") {
          state.validLoading = false;
          state.validCheckouts = checkouts;
          state.validPage = action.payload.page ?? 1;
          state.limit = action.payload.limit ?? state.limit;
          state.totalValidCheckouts = action.payload.total ?? checkouts.length;
          state.validTotalPages = action.payload.totalPages ?? 1;
        } else {
          state.expiredLoading = false;
          state.expiredCheckouts = checkouts;
          state.expiredPage = action.payload.page ?? 1;
          state.limit = action.payload.limit ?? state.limit;
          state.totalExpiredCheckouts =
            action.payload.total ?? checkouts.length;
          state.expiredTotalPages = action.payload.totalPages ?? 1;
        }
      })
      // fetch checkout details
      .addCase(fetchIncompleteCheckouts.rejected, (state, action) => {
        const status = action.meta.arg.status;

        if (status === "valid") state.validLoading = false;
        else state.expiredLoading = false;

        state.error =
          action.payload?.message || "Failed to fetch incomplete checkouts";
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
