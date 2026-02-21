import { logout } from "../../features/auth/slices/authSlice";
import { clearCart, fetchCart } from "../../features/cart/slices/cartSlice";
import { clearShipping } from "../../features/cart/slices/shippingSlice";

import type { AppDispatch, RootState } from "../../app/store";

export const logoutAndReset =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearShipping());
    const newGuestId = getState().auth.guestId;
    dispatch(fetchCart({ guestId: newGuestId }));
  };
