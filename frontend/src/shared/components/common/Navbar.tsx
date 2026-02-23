import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";

import Cartdrawer from "../layout/CartDrawer";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { assets, cloudinaryImageUrl } from "../../constants/cloudinary";
import { fetchActiveUserCheckout } from "../../../features/cart/slices/checkoutSlice";
import { clamp, formatCountdown } from "../../utils/timerCountdown";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState<boolean>(false);
  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { checkout } = useAppSelector((state) => state.checkout);

  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [expired, setExpired] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user?._id) return;

    if (!checkout?._id || checkout.isFinalized) {
      dispatch(fetchActiveUserCheckout());
    }
  }, [user?._id, checkout?._id, checkout?.isFinalized, dispatch]);

  useEffect(() => {
    if (!checkout?.expiresAt) {
      setTimeLeftMs(null);
      setExpired(false);
      return;
    }

    // if backend sends isExpired, you can early-exit too
    const expiresAtMs = new Date(checkout.expiresAt).getTime();

    const tick = () => {
      const remaining = clamp(expiresAtMs - Date.now());
      setTimeLeftMs(remaining);
      setExpired(remaining <= 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [checkout?.expiresAt]);

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  return (
    <>
      <nav className="container mx-auto flex justify-between py-4 px-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center hover:cursor-pointer"
          >
            <img
              src={cloudinaryImageUrl(assets.logos.horizontal.publicId)}
              alt={assets.logos.horizontal.alt}
              className="h-7 sm:h-7 md:h-8 w-auto object-contain"
              loading="eager"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-10">
          <Link
            to="/"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            HOME
          </Link>
          <Link
            to="/story"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            STORY
          </Link>
          <Link
            to="/shop"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            SHOP
          </Link>
          <Link
            to="/contact"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            CONTACT
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-ink px-2 py-1 rounded text-sm text-white"
            >
              Admin
            </Link>
          )}

          <Link
            to="/profile"
            className="hover:text-gray-600 hover:cursor-pointer"
          >
            <HiOutlineUser className="h-6 w-6" />
          </Link>

          <button
            onClick={toggleCartDrawer}
            className="relative inline-flex items-center gap-2 hover:text-gray-600 hover:cursor-pointer"
          >
            {/* bag + badge (badge stays attached to bag) */}
            <span className="relative inline-flex">
              <HiOutlineShoppingBag className="h-6 w-6" />

              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1 py-0.5">
                  {cartItemCount}
                </span>
              )}
            </span>

            {/* countdown to the right */}
            {checkout?._id &&
              cartItemCount > 0 &&
              !checkout.isFinalized &&
              timeLeftMs !== null &&
              !expired && (
                <span className="text-sm font-semibold text-gray-800 tabular-nums">
                  {formatCountdown(timeLeftMs)}
                </span>
              )}
          </button>

          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-6 w-6 hover:text-gray-600" />
          </button>
        </div>
      </nav>

      <Cartdrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

      {navDrawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={toggleNavDrawer}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] md:hidden"
        />
      )}

      <div
        className={[
          "fixed top-0 left-0 z-50 h-full md:hidden",
          "w-[82%] max-w-[360px] sm:w-[380px]",
          "bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          navDrawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <Link
            to="/"
            onClick={toggleNavDrawer}
            className="flex items-center gap-3"
          >
            <img
              src={cloudinaryImageUrl(assets.logos.horizontal.publicId)}
              alt={assets.logos.horizontal.alt}
              className="h-7 w-auto object-contain"
              loading="eager"
            />
          </Link>

          <button
            type="button"
            onClick={toggleNavDrawer}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:scale-[0.98]"
            aria-label="Close navigation"
          >
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="px-5 py-5">
          <nav className="space-y-2">
            <Link
              to="/"
              onClick={toggleNavDrawer}
              className="group flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-gray-50 transition"
            >
              <span className="uppercase tracking-widest text-sm">Home</span>
              <span className="text-gray-400 group-hover:text-gray-500">→</span>
            </Link>

            <Link
              to="/story"
              onClick={toggleNavDrawer}
              className="group flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-gray-50 transition"
            >
              <span className="uppercase tracking-widest text-sm">Story</span>
              <span className="text-gray-400 group-hover:text-gray-500">→</span>
            </Link>

            <Link
              to="/shop"
              onClick={toggleNavDrawer}
              className="group flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-gray-50 transition"
            >
              <span className="uppercase tracking-widest text-sm">Shop</span>
              <span className="text-gray-400 group-hover:text-gray-500">→</span>
            </Link>

            <Link
              to="/contact"
              onClick={toggleNavDrawer}
              className="group flex items-center justify-between rounded-xl px-4 py-3 text-ink hover:bg-gray-50 transition"
            >
              <span className="uppercase tracking-widest text-sm">Contact</span>
              <span className="text-gray-400 group-hover:text-gray-500">→</span>
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
