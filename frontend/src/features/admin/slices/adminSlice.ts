import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

import type { AppError } from "../../../shared/types/error";
import type {
  User,
  AddUserPayload,
  UpdateUserPayload,
  DeleteUserPayload,
} from "../../../shared/types/user";

import { API_URL, getAuthHeader } from "../../../shared/constants/api";

interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

// Async thunk to fetch all users (admin only)
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: AppError }
>("admin/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/users`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch users" });
  }
});

// Async thunk for creating a user
export const addUser = createAsyncThunk<
  { message: string; user: User },
  AddUserPayload,
  { rejectValue: AppError }
>("admin/addUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/users`, userData, {
      headers: getAuthHeader(),
    });
    return response.data; // returns {message, user}
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to add user" });
  }
});

export const updateUser = createAsyncThunk<
  { message: string; user: User },
  UpdateUserPayload,
  { rejectValue: AppError }
>(
  "admin/updateUser",
  async ({ id, name, email, role }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/users/${id}`,
        { name, email, role },
        {
          headers: getAuthHeader(),
        },
      );
      return response.data; // returns {message, user}
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update user" });
    }
  },
);

// Async thunk to delete a user
export const deleteUser = createAsyncThunk<
  string,
  DeleteUserPayload,
  { rejectValue: AppError }
>("admin/deleteUser", async ({ id }, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/api/admin/users/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to delete user" });
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })
      // addUser
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addUser.fulfilled,
        (state, action: PayloadAction<{ message: string; user: User }>) => {
          state.loading = false;
          state.users.push(action.payload.user);
        },
      )
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add users";
      })
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUser.fulfilled,
        (state, action: PayloadAction<{ message: string; user: User }>) => {
          const updatedUser = action.payload.user;
          const userIndex = state.users.findIndex(
            (user) => user._id === updatedUser._id,
          );
          if (userIndex !== -1) {
            state.users[userIndex] = updatedUser;
          }
          state.loading = false;
        },
      )
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update user";
      })
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete user";
      });
  },
});

export default adminSlice.reducer;
