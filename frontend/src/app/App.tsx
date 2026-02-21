import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Provider } from "react-redux";

import UserLayout from "../shared/components/layout/UserLayout";
import Home from "../features/landing/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Profile from "../features/profile/pages/Profile";
import ShopPage from "../features/products/pages/ShopPage";
import ProductDetails from "../features/products/components/ProductDetails";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Checkout from "../features/cart/components/Checkout";
import Payment from "../features/cart/components/Payment";
import OrderConfirmation from "../features/orders/pages/OrderConfirmation";
import OrderDetailsPage from "../features/orders/pages/OrderDetailsPage";
import MyOrdersPage from "../features/orders/pages/MyOrdersPage";
import AdminLayout from "../features/admin/components/AdminLayout";
import AdminHomePage from "../features/admin/pages/AdminHomePage";
import UserManagement from "../features/admin/pages/UserManagement";
import ProductManagement from "../features/admin/pages/ProductManagement";
import EditProductPage from "../features/admin/pages/EditProductPage";
import OrderManagement from "../features/admin/pages/OrderManagement";
import ForgotPassword from "../features/auth/pages/ForgotPassword";

import { store } from "./store";
import ProtectedRoute from "../shared/components/common/ProtectedRoute";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Verified from "../features/auth/pages/Verified";
import Story from "../features/landing/pages/Story";
import Contact from "../features/landing/pages/Contact";
import LearnMore from "../features/landing/pages/LearnMore";
import ScrollToTop from "../shared/utils/scrollToTop";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: "20px", padding: "20px 30px" },
          }}
        />
        <Routes>
          <Route path="/" element={<UserLayout />}>
            {/* User Layout */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={<Profile />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verified" element={<Verified />} />

            <Route path="story" element={<Story />} />
            <Route path="contact" element={<Contact />} />
            <Route path="learn-more" element={<LearnMore />} />
            {/* anything after a colon is a dynamic route */}
            <Route path="shop" element={<ShopPage />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="checkout/:cartId" element={<Checkout />} />
            <Route path="payment/:checkoutId" element={<Payment />} />
            <Route
              path="order/:orderId/confirmation"
              element={<OrderConfirmation />}
            />
            <Route path="order/:id" element={<OrderDetailsPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Admin Layout */}
            <Route index element={<AdminHomePage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route
              path="products/:id/edit/:variantId"
              element={<EditProductPage />}
            />
            <Route path="orders" element={<OrderManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
