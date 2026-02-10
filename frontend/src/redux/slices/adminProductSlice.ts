import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { API_URL, getAuthHeader } from "../../constants/api";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "../../types/product";
import type { AppError } from "../../types/error";
import type {
  ProductVariant,
  UpdateProductVariantPayload,
} from "../../types/productVariant";

interface AdminProductState {
  products: Product[];
  // productVariants: Record<string, ProductVariant[]>;
  selectedVariant: ProductVariant | null;
  loading: boolean;
  variantLoading: boolean;
  error: string | null;
}

const initialState: AdminProductState = {
  products: [],
  // productVariants: {},
  selectedVariant: null,
  loading: false,
  variantLoading: false,
  error: null,
};

// async thunk to fetch admin products
export const fetchAdminProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: AppError }
>("adminProducts/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/products`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response?.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch products admin" });
  }
});

// async thunk to create a new product.
// DON'T CALL THIS API YET. IMPLEMENTATION IS UNFINISHED
export const createProduct = createAsyncThunk<
  { Product: Product; ProductVariant: ProductVariant },
  CreateProductPayload & {
    // admin create currently expects these variant fields too until the route is refactored
    sku: string;
    price: number;
    discountPrice?: number;
    countInStock: number;
    category: "Learning Tower" | "Stool" | "Utensils" | "Accessories";
  },
  { rejectValue: AppError }
>("adminProducts/createProduct", async (productData, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/products`,
      productData,
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response?.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to create product" });
  }
});

// async thunk to update an existing product
export const updateProduct = createAsyncThunk<
  Product,
  UpdateProductPayload,
  { rejectValue: AppError }
>(
  "adminProducts/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/admin/products/${id}`,
        productData,
        {
          headers: getAuthHeader(),
        },
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update product" });
    }
  },
);

// async thunk to update an existing product
export const updateProductVariant = createAsyncThunk<
  ProductVariant,
  UpdateProductVariantPayload,
  { rejectValue: AppError }
>(
  "adminProducts/updateProductVariant",
  async ({ productId, variantId, variantData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/admin/products/${productId}/variants/${variantId}`,
        variantData,
        {
          headers: getAuthHeader(),
        },
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to update product" });
    }
  },
);

// async thunk to delete a product
export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: AppError }
>("adminProducts/deleteProduct", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/api/admin/products/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response?.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to delete product" });
  }
});

// async thunk to delete a product variant
export const deleteProductVariant = createAsyncThunk<
  { productId: string; variantId: string },
  { productId: string; variantId: string },
  { rejectValue: AppError }
>(
  "adminProducts/deleteVariant",
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/api/admin/products/${productId}/variants/${variantId}`,
        { headers: getAuthHeader() },
      );
      return { productId, variantId };
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to delete product variant" });
    }
  },
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.products = action.payload;
        },
      )
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch products admin";
      })
      // create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createProduct.fulfilled,
        (
          state,
          action: PayloadAction<{
            Product: Product;
            ProductVariant: ProductVariant;
          }>,
        ) => {
          state.loading = false;
          state.products.push(action.payload.Product);
          state.selectedVariant = action.payload.ProductVariant;
        },
      )
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create product";
      })
      // update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProduct.fulfilled,
        (state, action: PayloadAction<Product>) => {
          const updatedProduct = action.payload;
          const index = state.products.findIndex(
            (product) => product._id === updatedProduct._id,
          );
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
          state.loading = false;
        },
      )
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update product";
      })
      // update productVariant
      .addCase(updateProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateProductVariant.fulfilled,
        (state, action: PayloadAction<ProductVariant>) => {
          state.selectedVariant = action.payload;
          state.loading = false;
        },
      )
      .addCase(updateProductVariant.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update product variant";
      })
      // delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        deleteProduct.fulfilled,
        (state, action: PayloadAction<string>) => {
          const deletedId = action.payload;
          state.products = state.products.filter(
            (product) => product._id !== deletedId,
          );

          state.loading = false;
        },
      )
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete product";
      })
      // delete variant
      .addCase(deleteProductVariant.pending, (state) => {
        state.variantLoading = true;
        state.error = null;
      })
      .addCase(deleteProductVariant.fulfilled, (state) => {
        state.variantLoading = false;
        // We don't have variants list in this slice (only selectedVariant), so just clear it if needed.
        // If variants[] is later added, remove it from the list here.
        state.selectedVariant = null;
      })
      .addCase(deleteProductVariant.rejected, (state, action) => {
        state.variantLoading = false;
        state.error =
          action.payload?.message || "Failed to delete product variant";
      });
  },
});

export default adminProductSlice.reducer;
