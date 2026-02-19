// SUBSCRIBER SLICE TO BE USED BY ADMINS

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { AppError } from "../../types/error";
import type {
  Subscriber,
  FetchSubscribersResponse,
  SendAnnouncementPayload,
  SendAnnouncementResponse,
} from "../../types/subscriber";
import { API_URL, getAuthHeader } from "../../constants/api";

interface SubscriberState {
  subscribers: Subscriber[];
  loading: boolean;
  error: string | null;
  sendingAnnouncement: boolean;
  announcementError: string | null;
}

const initialState: SubscriberState = {
  subscribers: [],
  loading: false,
  error: null,
  sendingAnnouncement: false,
  announcementError: null,
};

// Async thunk to fetch all subscribers (admin only)
export const fetchSubscribers = createAsyncThunk<
  FetchSubscribersResponse,
  void,
  { rejectValue: AppError }
>("subscriber/fetchSubscribers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/subscribers`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch subscribers" });
  }
});

// Async thunk to send announcement to all subscribers (admin only)
export const sendAnnouncement = createAsyncThunk<
  SendAnnouncementResponse,
  SendAnnouncementPayload,
  { rejectValue: AppError }
>(
  "subscriber/sendAnnouncement",
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/subscribers/email`,
        announcementData,
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
      return rejectWithValue({ message: "Failed to send announcement" });
    }
  },
);

// Async thunk to add a new subscriber
export const addSubscriber = createAsyncThunk<
  { message: string },
  { email: string },
  { rejectValue: AppError }
>("subscriber/addSubscriber", async ({ email }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/api/subscribe`, { email });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to add subscriber" });
  }
});

const subscriberSlice = createSlice({
  name: "subscriber",
  initialState,
  reducers: {
    clearAnnouncementError: (state) => {
      state.announcementError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscribers
      .addCase(fetchSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubscribers.fulfilled,
        (state, action: PayloadAction<FetchSubscribersResponse>) => {
          state.loading = false;
          state.subscribers = action.payload.subscribers;
        },
      )
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch subscribers";
      })
      // Send announcement
      .addCase(sendAnnouncement.pending, (state) => {
        state.sendingAnnouncement = true;
        state.announcementError = null;
      })
      .addCase(sendAnnouncement.fulfilled, (state) => {
        state.sendingAnnouncement = false;
      })
      .addCase(sendAnnouncement.rejected, (state, action) => {
        state.sendingAnnouncement = false;
        state.announcementError =
          action.payload?.message || "Failed to send announcement";
      })
      // Add subscriber
      .addCase(addSubscriber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubscriber.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addSubscriber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add subscriber";
      });
  },
});

export const { clearAnnouncementError } = subscriberSlice.actions;

export default subscriberSlice.reducer;
