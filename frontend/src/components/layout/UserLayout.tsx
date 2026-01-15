import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import Footer from "../common/Footer";
import Header from "../common/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { isJwtExpired } from "../../utils/jwt";
import { logoutAndReset } from "../../utils/logoutReset";
import { fetchCart } from "../../redux/slices/cartSlice";

const UserLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // sessions expiry check
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token && isJwtExpired(token)) {
      setShowSessionExpiredModal(true);
      dispatch(logoutAndReset());
      return;
    }
    if (user) {
      dispatch(
        fetchCart({
          userId: user._id,
        })
      );
    }
  }, [dispatch, user]);

  return (
    <>
      {/* Header */}
      <Header />
      {/* Main content */}
      <main>
        {/* Outlet can change child component depending on route we access */}
        <Outlet />
        {showSessionExpiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6">
              <h2 className="text-lg font-semibold">Session expired</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your session has expired. Please log in again.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-lg bg-black px-4 py-2 text-white cursor-pointer"
                  onClick={() => {
                    setShowSessionExpiredModal(false);
                    navigate("/login");
                  }}
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default UserLayout;
