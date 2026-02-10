import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { Product } from "../../types/product";
import type { ProductVariant } from "../../types/productVariant";
import type { AppError } from "../../types/error";
import { API_URL } from "../../constants/api";
import { updateProduct } from "./adminProductSlice";

interface ProductState {
  products: Product[];
  productVariants: Record<string, ProductVariant[]>;
  selectedProduct: Product | null;
  selectedVariant: ProductVariant | null;
  similarProducts: Product[];
  similarProductVariants: Record<string, ProductVariant[]>;
  loading: boolean;
  variantLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  productVariants: {},
  selectedProduct: null,
  selectedVariant: null,
  similarProducts: [],
  similarProductVariants: {},
  loading: false,
  variantLoading: false,
  error: null,
};

// async thunk to fetch products
export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: AppError }
>("products/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<Product[]>(
      `${API_URL as string}/api/products`,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch products" });
  }
});

// async thunk to fetch a single product by ID
export const fetchProductDetails = createAsyncThunk<
  Product, // return type
  { id: string }, // args
  { rejectValue: AppError }
>("products/fetchProductDetails", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await axios.get<Product>(
      `${API_URL as string}/api/products/${id}`,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch product details" });
  }
});

// async thunk to fetch similar products.
// DON'T CALL THIS API. IT IS NOT REQUIRED
export const fetchSimilarProducts = createAsyncThunk<
  Product[],
  { id: string },
  { rejectValue: AppError }
>("products/fetchSimilarProducts", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await axios.get<Product[]>(
      `${API_URL as string}/api/products/similar/${id}`,
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch similar products" });
  }
});

// async thunk to get all product variants
export const fetchProductVariants = createAsyncThunk<
  ProductVariant[],
  { productIds: string[] },
  { rejectValue: AppError }
>("products/fetchVariants", async ({ productIds }, { rejectWithValue }) => {
  try {
    const response = await axios.post<ProductVariant[]>(
      `${API_URL}/api/products/variants/bulk`,
      { productIds },
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch product variants" });
  }
});
// async thunk to get all similar products' variants
export const fetchSimilarProductVariants = createAsyncThunk<
  ProductVariant[],
  { productIds: string[] },
  { rejectValue: AppError }
>(
  "products/fetchSimilarVariants",
  async ({ productIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post<ProductVariant[]>(
        `${API_URL}/api/products/variants/bulk`,
        { productIds },
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError<AppError>;
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: "Failed to fetch product variants" });
    }
  },
);

// async thunk to fetch ONE product variant details
export const fetchProductVariant = createAsyncThunk<
  ProductVariant,
  {
    productId: string;
    color?: string;
    variant?: string;
    ovenMitt?: string;
    stabiliser?: string;
    productVariantId?: string;
  },
  { rejectValue: AppError }
>("products/fetchProductVariant", async (args, { rejectWithValue }) => {
  const { productId, color, variant, ovenMitt, stabiliser, productVariantId } =
    args;

  try {
    const params = productVariantId
      ? { productVariantId }
      : { color, variant, ovenMitt, stabiliser };
    const response = await axios.get<ProductVariant>(
      `${API_URL as string}/api/products/${productId}/variant`,
      { params: params },
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<AppError>;
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ message: "Failed to fetch product variant" });
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.products = Array.isArray(action.payload) ? action.payload : [];
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch products";
      })
      // FETCH DETAILS
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedVariant = null;
      })
      .addCase(
        fetchProductDetails.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.loading = false;
          state.selectedProduct = action.payload;
        },
      )
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch product details";
      })
      // SIMILAR PRODUCTS
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSimilarProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.similarProducts = action.payload;
        },
      )
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch similar products";
      })
      // FETCH VARIANTS (BULK)
      .addCase(fetchProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        state.loading = false;
        // Clear old data and rebuild the map
        const newMap: Record<string, ProductVariant[]> = {};

        action.payload.forEach((variant) => {
          if (!newMap[variant.productId]) {
            newMap[variant.productId] = [];
          }
          newMap[variant.productId].push(variant);
        });

        state.productVariants = {
          ...state.productVariants,
          ...newMap,
        };
      })
      .addCase(fetchProductVariants.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to bulk fetch product variants";
      })
      // FETCH SIMLIAR VARIANTS (BULK)
      .addCase(fetchSimilarProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProductVariants.fulfilled, (state, action) => {
        state.loading = false;
        // Clear old data and rebuild the map
        const newMap: Record<string, ProductVariant[]> = {};

        action.payload.forEach((variant) => {
          if (!newMap[variant.productId]) {
            newMap[variant.productId] = [];
          }
          newMap[variant.productId].push(variant);
        });

        state.similarProductVariants = newMap;
      })
      .addCase(fetchSimilarProductVariants.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to bulk fetch product variants";
      })
      // VARIANT
      .addCase(fetchProductVariant.pending, (state) => {
        state.variantLoading = true;
        state.error = null;
      })
      .addCase(
        fetchProductVariant.fulfilled,
        (state, action: PayloadAction<ProductVariant>) => {
          state.variantLoading = false;
          state.selectedVariant = action.payload;
        },
      )
      .addCase(fetchProductVariant.rejected, (state, action) => {
        state.variantLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch product variant";
      })
      // listener for update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.products.findIndex((p) => p._id === updated._id);
        if (idx !== -1) state.products[idx] = updated;
        if (state.selectedProduct?._id === updated._id) {
          state.selectedProduct = updated;
        }
      });
  },
});

export default productSlice.reducer;
