import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

import type {
  ShippingCostRequest,
  ShippingCostResponse,
  ShippingDetails,
  ShippingOption,
} from "../../../shared/types/checkout";
import type { AppError } from "../../../shared/types/error";

import { API_URL, getAuthHeader } from "../../../shared/constants/api";

// Helper functions to load from localStorage
const loadShippingDetailsFromStorage = (): ShippingDetails | null => {
  const stored = localStorage.getItem("shippingDetails");
  return stored ? (JSON.parse(stored) as ShippingDetails) : null;
};

const loadSelectedShippingFromStorage = (): ShippingOption | null => {
  const stored = localStorage.getItem("selectedShipping");
  return stored ? (JSON.parse(stored) as ShippingOption) : null;
};

const loadShippingOptionsFromStorage = (): ShippingOption[] => {
  const stored = localStorage.getItem("shippingOptions");
  return stored ? (JSON.parse(stored) as ShippingOption[]) : [];
};

export interface ShippingState {
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  shippingLoading: boolean;
  shippingError: string | null;
  shippingDetails: ShippingDetails | null;
  gojekDisabled: boolean;
}

const initialState: ShippingState = {
  shippingOptions: loadShippingOptionsFromStorage(),
  selectedShipping: loadSelectedShippingFromStorage(),
  shippingLoading: false,
  shippingError: null,
  shippingDetails: loadShippingDetailsFromStorage(),
  gojekDisabled: false,
};

// Async thunk to calculate shipping cost
export const calculateShippingCost = createAsyncThunk<
  ShippingCostResponse,
  ShippingCostRequest,
  { rejectValue: AppError }
>("shipping/calculateShippingCost", async (request, { rejectWithValue }) => {
  try {
    const response = await axios.post<ShippingCostResponse>(
      `${API_URL}/api/calculate-shipping`,
      request,
      { headers: getAuthHeader() },
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data)
      return rejectWithValue(error.response.data);
    return rejectWithValue({ message: "Failed to calculate shipping cost" });
  }
});

const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    setSelectedShipping: (state, action: PayloadAction<ShippingOption>) => {
      state.selectedShipping = action.payload;
      localStorage.setItem("selectedShipping", JSON.stringify(action.payload));
    },
    setShippingDetails: (state, action: PayloadAction<ShippingDetails>) => {
      state.shippingDetails = action.payload;
      localStorage.setItem("shippingDetails", JSON.stringify(action.payload));
    },
    clearShipping: (state) => {
      state.shippingOptions = [];
      state.selectedShipping = null;
      state.shippingError = null;
      state.shippingDetails = null;
      state.gojekDisabled = false;

      localStorage.removeItem("shippingOptions");
      localStorage.removeItem("selectedShipping");
      localStorage.removeItem("shippingDetails");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateShippingCost.pending, (state) => {
        state.shippingLoading = true;
        state.shippingError = null;
      })
      .addCase(
        calculateShippingCost.fulfilled,
        (state, action: PayloadAction<ShippingCostResponse>) => {
          state.shippingLoading = false;

          state.shippingOptions = action.payload.options;
          state.gojekDisabled = !!action.payload.gojekDisabled;
          localStorage.setItem(
            "shippingOptions",
            JSON.stringify(action.payload.options),
          );

          // If gojek is disabled, treat gojek options as not selectable
          const isSelectable = (opt: ShippingOption) =>
            !(state.gojekDisabled && opt.courierCode === "gojek");

          const options = action.payload.options;
          const prev = state.selectedShipping;
          // keep previous selection if it still exists in new options AND is selectable
          const keptPrev =
            prev &&
            options.find(
              (opt) =>
                opt.courierCode === prev.courierCode &&
                opt.courierServiceName === prev.courierServiceName &&
                isSelectable(opt),
            );
          const defaultOpt = options.find(isSelectable) || null;
          state.selectedShipping = keptPrev || defaultOpt;

          if (state.selectedShipping) {
            localStorage.setItem(
              "selectedShipping",
              JSON.stringify(state.selectedShipping),
            );
          } else {
            localStorage.removeItem("selectedShipping");
          }
        },
      )
      .addCase(calculateShippingCost.rejected, (state, action) => {
        state.shippingLoading = false;
        state.shippingError =
          action.payload?.message || "Failed to calculate shipping cost";
      });
  },
});

export const { setSelectedShipping, setShippingDetails, clearShipping } =
  shippingSlice.actions;

export default shippingSlice.reducer;
