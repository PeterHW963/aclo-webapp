import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  XMarkIcon,
  ChevronUpIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchActiveUserCheckout } from "../../../features/cart/slices/checkoutSlice";

type Props = {
  hideOnPaths?: string[];
  fallbackExpiryHours?: number;

  topOffsetClass?: string;
};

const LS_COLLAPSED_KEY_MOBILE = "payment_banner_collapsed_mobile";
const LS_COLLAPSED_KEY_DESKTOP = "payment_banner_collapsed_desktop";

const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

const msToHMS = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const PaymentPendingBanner = ({
  hideOnPaths = ["/admin"],
  fallbackExpiryHours = 24,
  topOffsetClass = "top-24 sm:top-24",
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((s) => s.auth);
  const { checkout } = useAppSelector((s) => s.checkout);

  const [now, setNow] = useState(() => Date.now());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const getCollapsedKey = (mobile: boolean) =>
    mobile ? LS_COLLAPSED_KEY_MOBILE : LS_COLLAPSED_KEY_DESKTOP;

  // Track screen size
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);

    const update = () => setIsMobile(mq.matches);
    update();

    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  // Restore collapsed state (mobile defaults collapsed if no saved preference)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const mobile = mq.matches;
    setIsMobile(mobile);

    const raw = localStorage.getItem(getCollapsedKey(mobile));

    if (raw === "1") {
      setIsCollapsed(true);
      return;
    }

    if (raw === "0") {
      setIsCollapsed(false);
      return;
    }

    setIsCollapsed(mobile); // mobile default collapsed, desktop expanded
  }, []);

  // When device type changes (resize), restore that device's preference
  useEffect(() => {
    const raw = localStorage.getItem(getCollapsedKey(isMobile));

    if (raw === "1") {
      setIsCollapsed(true);
      return;
    }

    if (raw === "0") {
      setIsCollapsed(false);
      return;
    }

    setIsCollapsed(isMobile);
  }, [isMobile]);

  // New checkout: mobile defaults collapsed, desktop expanded
  useEffect(() => {
    if (!checkout?._id) return;

    const key = getCollapsedKey(isMobile);

    if (isMobile) {
      setIsCollapsed(true);
      localStorage.setItem(key, "1");
    } else {
      setIsCollapsed(false);
      localStorage.setItem(key, "0");
    }
  }, [checkout?._id, isMobile]);

  // Fetch active checkout
  useEffect(() => {
    if (!user?._id) return;

    if (!checkout?._id || checkout.isFinalized) {
      dispatch(fetchActiveUserCheckout());
    }
  }, [user?._id, checkout?._id, checkout?.isFinalized, dispatch]);

  // Refresh while pending (polling)
  useEffect(() => {
    if (!user?._id) return;
    if (!checkout?._id) return;
    if (checkout.isFinalized) return;

    const id = window.setInterval(() => {
      dispatch(fetchActiveUserCheckout());
    }, 30_000);

    return () => window.clearInterval(id);
  }, [user?._id, checkout?._id, checkout?.isFinalized, dispatch]);

  // Refresh when user returns to tab/window (helps after payment redirects / external tabs)
  useEffect(() => {
    if (!user?._id) return;

    const handleFocus = () => {
      dispatch(fetchActiveUserCheckout());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchActiveUserCheckout());
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?._id, dispatch]);

  // Expiry
  const expiresAtMs = useMemo(() => {
    if (!checkout) return null;

    const c = checkout as unknown as {
      expiresAt?: string;
      paymentExpiresAt?: string;
      createdAt?: string;
    };

    if (c.expiresAt) {
      const t = new Date(c.expiresAt).getTime();
      if (!Number.isNaN(t)) return t;
    }

    if (c.paymentExpiresAt) {
      const t = new Date(c.paymentExpiresAt).getTime();
      if (!Number.isNaN(t)) return t;
    }

    if (c.createdAt) {
      const created = new Date(c.createdAt).getTime();
      if (!Number.isNaN(created)) {
        return created + fallbackExpiryHours * 60 * 60 * 1000;
      }
    }

    return null;
  }, [checkout, fallbackExpiryHours]);

  // Countdown tick
  useEffect(() => {
    if (!checkout?._id) return;
    if (checkout.isFinalized) return;
    if (!expiresAtMs) return;

    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [checkout?._id, checkout?.isFinalized, expiresAtMs]);

  const remainingMs = useMemo(() => {
    if (!expiresAtMs) return 0;
    return Math.max(0, expiresAtMs - now);
  }, [expiresAtMs, now]);

  const isHiddenByPath = hideOnPaths.some((p) =>
    location.pathname.startsWith(p),
  );

  const isOnSamePaymentPage =
    !!checkout?._id && location.pathname === `/payment/${checkout._id}`;

  // Optional stricter payment status checks (if backend sends this field)
  const checkoutWithPaymentStatus = checkout as
    | (typeof checkout & { paymentStatus?: string | null })
    | null;

  const paymentStatus = checkoutWithPaymentStatus?.paymentStatus
    ?.toLowerCase()
    .trim();

  const looksPaidByStatus =
    paymentStatus === "paid" ||
    paymentStatus === "completed" ||
    paymentStatus === "success" ||
    paymentStatus === "succeeded";

  const shouldExist =
    !isHiddenByPath &&
    !isOnSamePaymentPage &&
    !!user?._id &&
    !!checkout?._id &&
    !checkout.isFinalized &&
    !looksPaidByStatus &&
    remainingMs > 0;

  if (!shouldExist) return null;

  const timeLabel = msToHMS(remainingMs);

  const handleContinue = () => {
    if (!checkout?._id) return;
    navigate(`/payment/${checkout._id}`);
  };

  const handleCollapse = () => {
    setIsCollapsed(true);
    localStorage.setItem(getCollapsedKey(isMobile), "1");
  };

  const handleExpand = () => {
    setIsCollapsed(false);
    localStorage.setItem(getCollapsedKey(isMobile), "0");
  };

  return (
    <div
      className={`fixed right-3 sm:right-4 z-30 ${topOffsetClass}`}
      aria-live="polite"
    >
      {isCollapsed ? (
        // Collapsed pill (same style on mobile + desktop)
        <button
          type="button"
          onClick={handleExpand}
          className="group flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-2xl border border-blue-100 bg-white/95 px-3 py-2.5 shadow-md backdrop-blur transition hover:shadow-lg active:scale-[0.99]"
          aria-label="Open payment reminder"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <CreditCardIcon className="h-4 w-4 text-acloblue" />
          </div>

          <div className="min-w-0 text-left leading-tight">
            <p className="truncate text-xs font-semibold text-gray-900">
              Payment pending
            </p>
            <p className="truncate text-[11px] text-gray-500 sm:text-xs">
              Tap to continue 💳
            </p>
          </div>

          <span className="ml-1 shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-acloblue">
            {timeLabel}
          </span>
        </button>
      ) : (
        // Expanded card
        <div className="w-[min(88vw,340px)] sm:w-[320px]">
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-xl backdrop-blur">
            <div className="p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <span className="text-base">💳</span>
                    Payment pending
                  </p>
                  <p className="mt-1 text-xs leading-snug text-gray-600 sm:text-sm">
                    Your payment expires in{" "}
                    <span className="font-semibold text-acloblue">
                      {timeLabel}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCollapse}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
                  aria-label="Minimize payment reminder"
                  title="Minimize"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex-1 rounded-xl bg-acloblue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99]"
                >
                  Continue Payment
                </button>

                <button
                  type="button"
                  onClick={handleCollapse}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                  aria-label="Minimize"
                  title="Minimize"
                >
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPendingBanner;
