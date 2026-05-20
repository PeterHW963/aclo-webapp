import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

import type { Cart } from "../../../shared/types/cart";
import type { User } from "../../../shared/types/user";
import type { AppError } from "../../../shared/types/error";

import { API_URL, getAuthHeader } from "../../../shared/constants/api";

interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
}

// helper function to load cart from localStorage
const loadCartFromStorage = (): Cart => {
  const storedCart = localStorage.getItem("cart");
  return storedCart
    ? (JSON.parse(storedCart) as Cart)
    : { _id: "", products: [], totalPrice: 0 };
};

const initialState: CartState = {
  cart: loadCartFromStorage(),
  loading: false,
  error: null,
};

// helper function to save cart to localStorage
const saveCartToStorage = (cart: Cart): void => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Fetch cart for a user/guest
export const fetchCart = createAsyncThunk<
  Cart,
  { userId?: string; guestId?: string },
  { rejectValue: AppError }
>("cart/fetchCart", async ({ userId, guestId }, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/cart`, {
      params: { userId, guestId },
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch cart" });
  }
});

export const fetchCartById = createAsyncThunk<
  Cart,
  { cartId: string },
  { rejectValue: AppError }
>("cart/fetchCartById", async ({ cartId }, { rejectWithValue }) => {
  try {
    const response = await axios.get<Cart>(`${API_URL}/api/cart/${cartId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response?.data) return rejectWithValue(error.response.data);
    return rejectWithValue({ message: "Failed to fetch cart by id" });
  }
});

// Add an item to the cart for a user/guest
export const addToCart = createAsyncThunk<
  Cart,
  {
    productId: string;
    productVariantId: string;
    quantity: number;
    options?: Record<string, any>;
    guestId?: string;
    userId?: string;
  },
  { rejectValue: AppError }
>(
  "cart/addToCart",
  async (
    { productId, productVariantId, quantity, options, guestId, userId },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post<Cart>(`${API_URL}/api/cart`, {
        productId,
        productVariantId,
        quantity,
        options,
        guestId,
        userId,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to add to cart" });
    }
  },
);

// update the quantity of an item in the cart
export const updateCartItemQuantity = createAsyncThunk<
  Cart,
  {
    productVariantId: string;
    quantity: number;
    options?: Record<string, any>;
    guestId?: string;
    userId?: string;
  },
  { rejectValue: AppError }
>(
  "cart/updateCartItemQuantity",
  async (
    { productVariantId, quantity, options, guestId, userId },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.put<Cart>(`${API_URL}/api/cart`, {
        productVariantId,
        quantity,
        options,
        guestId,
        userId,
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update item quantity" });
    }
  },
);

// Remove an item from the cart
export const removeFromCart = createAsyncThunk<
  Cart,
  {
    productVariantId: string;
    options?: Record<string, any>;
    guestId?: string;
    userId?: string;
  },
  { rejectValue: AppError }
>(
  "cart/removeFromCart",
  async (
    { productVariantId, options, guestId, userId },
    { rejectWithValue },
  ) => {
    try {
      // diff syntax because DELETE method in axios treats 2nd argument as options, not as req body
      const response = await axios.delete<Cart>(`${API_URL}/api/cart`, {
        data: { productVariantId, options, guestId, userId },
      });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to remove item" });
    }
  },
);

// Merge guest cart into user cart
export const mergeCart = createAsyncThunk<
  Cart,
  { guestId: string; user: User },
  { rejectValue: AppError }
>("cart/mergeCart", async ({ guestId, user }, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/cart/merge`,
      { guestId, user },
      {
        headers: getAuthHeader(),
      },
    );
    return response.data as Cart;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to merge cart" });
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = { _id: "", products: [], totalPrice: 0 };
      localStorage.removeItem("cart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch cart";
      })
      .addCase(fetchCartById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartById.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(fetchCartById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch cart by Id";
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to add to cart";
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update item quantity";
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to remove item";
      })
      .addCase(mergeCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        saveCartToStorage(action.payload);
      })
      .addCase(mergeCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to merge cart";
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
