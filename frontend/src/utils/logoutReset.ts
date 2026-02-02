import { logout } from "../redux/slices/authSlice";
import { clearCart, fetchCart } from "../redux/slices/cartSlice";
import { clearShipping } from "../redux/slices/shippingSlice";
import type { AppDispatch, RootState } from "../redux/store";

export const logoutAndReset =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearShipping());
    const newGuestId = getState().auth.guestId;
    dispatch(fetchCart({ guestId: newGuestId }));
  };
