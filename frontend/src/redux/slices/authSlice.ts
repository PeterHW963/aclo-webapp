import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { User, ShippingAddress } from "../../types/user";
import type { LoginPayload, RegisterPayload } from "../../types/auth";
import type { AppError } from "../../types/error";
import { API_URL } from "../../constants/api";

interface AuthState {
  user: User | null;
  guestId: string;
  loading: boolean;
  error: string | null;
}

// retrieve user info and token from localStorage if available
const userFromStorage: User | null = (() => {
  const stored = localStorage.getItem("userInfo");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
})();

// check for an existing guest ID in the localStorage or generate a new one
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

// initial state
const initialState: AuthState = {
  user: userFromStorage ?? null,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// Async Thunk for handling login process
export const loginUser = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: AppError }
>("auth/loginUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${API_URL as string}/api/users/login`,
      userData,
    );
    localStorage.setItem("userInfo", JSON.stringify(response.data.user));
    localStorage.setItem("userToken", response.data.token);

    // return user obj from response
    return response.data.user as User;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Login failed" });
  }
});

// Async Thunk for handling user registration process
export const registerUser = createAsyncThunk<
  { success: boolean; message: string },
  RegisterPayload,
  { rejectValue: AppError }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${API_URL as string}/api/users/register`,
      userData,
    );

    // return success message from response (no autologin)
    return response.data as { success: boolean; message: string };
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Registration failed" });
  }
});

// Async Thunk for adding a shipping address
export const addShippingAddress = createAsyncThunk<
  User,
  Omit<ShippingAddress, "_id" | "createdAt" | "updatedAt">,
  { rejectValue: AppError }
>("auth/addShippingAddress", async (addressData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axios.post(
      `${API_URL as string}/api/users/profile/addresses`,
      addressData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to add shipping address" });
  }
});

// Async Thunk for updating a shipping address
export const updateShippingAddress = createAsyncThunk<
  User,
  {
    addressId: string;
    updates: Partial<Omit<ShippingAddress, "_id" | "createdAt" | "updatedAt">>;
  },
  { rejectValue: AppError }
>(
  "auth/updateShippingAddress",
  async ({ addressId, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.patch(
        `${API_URL as string}/api/users/profile/addresses/${addressId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update shipping address" });
    }
  },
);

// Async Thunk for user email verification
export const verifyEmail = createAsyncThunk<
  User,
  string,
  { rejectValue: AppError }
>(
  "auth/verifyEmail", 
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL as string}/api/users/verify-email/${token}`,
      );
      
      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return response.data.user as User;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Email verification failed" });
    }
});

// Async Thunk for resending verification email
export const resendVerification = createAsyncThunk<
  { success: boolean; message: string },
  void,
  { rejectValue: AppError }
>("auth/resendVerification", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("userToken");
    const response = await axios.post(
      `${API_URL as string}/api/users/resend-verification`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data as { success: boolean; message: string };
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to resend verification email" });
  }
});

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId); // set a new guest ID in localStorage
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // don't update state because we are asking user to login
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Registration failed";
      })
      .addCase(addShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(state.user));
      })
      .addCase(addShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ?? "Failed to add shipping address";
      })
      .addCase(updateShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(state.user));
      })
      .addCase(updateShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message ?? "Failed to update shipping address";
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Email verification failed";
      })
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Failed to resend email verification";
      });
  },
});

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer; // add the reducer to the redux store
