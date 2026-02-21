import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/slices/authSlice";
import productReducer from "../features/products/slices/productsSlice";
import cartReducer from "../features/cart/slices/cartSlice";
import checkoutReducer from "../features/cart/slices/checkoutSlice";
import orderReducer from "../features/orders/slices/orderSlice";
import reviewReducer from "../features/products/slices/reviewsSlice";
import shippingReducer from "../features/cart/slices/shippingSlice";
import adminReducer from "../features/admin/slices/adminSlice";
import adminProductReducer from "../features/admin/slices/adminProductSlice";
import adminOrderReducer from "../features/admin/slices/adminOrderSlice";
import adminCheckoutReducer from "../features/admin/slices/adminCheckoutSlice";
import subscriberReducer from "../features/admin/slices/subscriberSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    orders: orderReducer,
    reviews: reviewReducer,
    shipping: shippingReducer,
    admin: adminReducer,
    adminProducts: adminProductReducer,
    adminOrders: adminOrderReducer,
    adminCheckouts: adminCheckoutReducer,
    subscribers: subscriberReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
