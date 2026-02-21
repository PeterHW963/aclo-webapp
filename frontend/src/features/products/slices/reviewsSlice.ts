import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

import type { Review } from "../../../shared/types/review";
import type { AppError } from "../../../shared/types/error";

import { API_URL } from "../../../shared/constants/api";

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
};

// async thunk to fetch all reviews to feature in landing page
export const fetchFeatReviews = createAsyncThunk<
  Review[],
  void,
  { rejectValue: AppError }
>("reviews/fetchFeatAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Review[]>(
      `${API_URL as string}/api/reviews/landing-featured`,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch reviews" });
  }
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchFeatReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFeatReviews.fulfilled,
        (state, action: PayloadAction<Review[]>) => {
          state.loading = false;
          state.reviews = Array.isArray(action.payload) ? action.payload : [];
        },
      )
      .addCase(fetchFeatReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch reviews";
      });
  },
});

export default reviewSlice.reducer;
