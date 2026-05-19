import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";

import CartContents from "../../../features/cart/components/CartContents";
import VerificationModal from "../common/VerificationModal";
import { useAppSelector } from "../../../app/hooks";

type CartDrawerProps = {
  drawerOpen: boolean;
  toggleCartDrawer: () => void;
};

const Cartdrawer = ({ drawerOpen, toggleCartDrawer }: CartDrawerProps) => {
  const navigate = useNavigate();
  const { user, guestId } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);
  const userId = user?._id;

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const isEmpty = !cart || !cart.products || cart.products.length === 0;

  const handleCheckout = () => {
    toggleCartDrawer();

    if (!user) {
      navigate("/login?redirect=/checkout");
      return;
    }

    if (!user.isVerified) {
      setShowVerificationModal(true);
      return;
    }

    navigate(`/checkout`);
  };

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 transition-opacity duration-300",
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Close cart"
          onClick={toggleCartDrawer}
          className="h-full w-full bg-black/30 backdrop-blur-[1px]"
        />
      </div>

      <aside
        className={[
          "fixed top-0 right-0 z-50 h-full",
          "w-[92%] max-w-[420px] sm:w-[420px] md:w-[460px]",
          "bg-white shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!drawerOpen}
      >
        <div className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-acloblue tracking-tight">
              Your Cart
            </h2>

            <button
              type="button"
              onClick={toggleCartDrawer}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 hover:cursor-pointer active:scale-[0.98]"
              aria-label="Close cart drawer"
            >
              <IoMdClose className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grow px-5 py-5 overflow-y-auto">
          {!isEmpty ? (
            <CartContents cart={cart} userId={userId} guestId={guestId} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="h-14 w-14 rounded-2xl bg-acloblue/10 text-acloblue flex items-center justify-center">
                <HiOutlineShoppingBag className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Your cart is empty
              </h3>
              <p className="mt-1 text-sm text-gray-600 max-w-[260px]">
                Browse the shop and add your favourites — we’ll keep them here
                ✨
              </p>

              <div className="mt-6 w-full flex flex-col gap-3">
                <Link
                  to="/shop"
                  onClick={toggleCartDrawer}
                  className="inline-flex items-center justify-center rounded-xl bg-acloblue px-4 py-3 text-white font-semibold hover:opacity-95 transition"
                >
                  Shop now
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!isEmpty ? (
            <>
              <button
                onClick={handleCheckout}
                className="w-full bg-acloblue text-white py-3 rounded-xl font-semibold hover:opacity-90 transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
              <p className="text-xs tracking-tighter text-gray-500 mt-2 text-center">
                Shipping, taxes, and discount codes calculated at checkout.
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-500 text-center">
              No rush - take your time picking the perfect pieces
            </p>
          )}
        </div>

        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
        />
      </aside>
    </>
  );
};

export default Cartdrawer;
