import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice";
import orderReducer from "./slices/orderSlice";
import reviewReducer from "./slices/reviewsSlice";
import shippingReducer from "./slices/shippingSlice";
import adminReducer from "./slices/adminSlice";
import adminProductReducer from "./slices/adminProductSlice";
import adminOrderReducer from "./slices/adminOrderSlice";
import adminCheckoutReducer from "./slices/adminCheckoutSlice";
import subscriberReducer from "./slices/subscriberSlice";

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
