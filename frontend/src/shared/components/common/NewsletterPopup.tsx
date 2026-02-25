import { useMemo, useState, type FormEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { addSubscriber } from "../../../features/admin/slices/subscriberSlice";

const LS_KEY_SUBSCRIBED = "newsletter_popup_subscribed";

const NewsletterPopup = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.subscribers);

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");

  const isSubscribedBefore = useMemo(() => {
    return localStorage.getItem(LS_KEY_SUBSCRIBED) === "1";
  }, []);

  const close = () => {
    setOpen(false);
    setMobileOpen(false);
  };

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await dispatch(addSubscriber({ email })).unwrap();
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
      setOpen(false);
      setMobileOpen(false);
      localStorage.setItem(LS_KEY_SUBSCRIBED, "1");
    } catch (err) {
      console.error(err);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  if (isSubscribedBefore) return null;

  return (
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-4 right-4 z-50 rounded-full bg-acloblue px-4 py-3 text-white shadow-lg text-md font-semibold hover:opacity-95 active:scale-[0.98]"
            aria-label="Open newsletter signup"
          >
            ✨ Get promos
          </button>
        )}

        {mobileOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/30"
              onClick={close}
              aria-label="Close newsletter signup backdrop"
            />

            <div className="fixed inset-x-0 bottom-0 z-50">
              <div className="mx-auto w-full max-w-[520px] rounded-t-2xl bg-mutedbrown shadow-2xl">
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-md font-semibold text-acloblue">
                      ✨ Psst… want promos?
                    </p>
                    <p className="mt-1 text-sm text-black-600">
                      Join our newsletter for exclusive offers and new releases
                      - straight to your inbox.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-acloblue hover:opacity-70"
                    aria-label="Close newsletter popup"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="px-4 pb-5">
                  <form onSubmit={handleSubscribe} className="flex">
                    <input
                      type="email"
                      placeholder="Leave us your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-t border-l border-b border-acloblue rounded-l-md focus:outline-none transition-all p-3 text-sm text-acloblue"
                      required
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      disabled={loading}
                      className="
                        group
                        bg-acloblue text-white
                        border border-acloblue
                        px-3 py-3 rounded-r-md
                        hover:opacity-70 hover:cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="fixed bottom-4 right-4 z-50 rounded-lg bg-acloblue px-4 py-3 text-white shadow-lg text-sm font-semibold hover:opacity-95 active:scale-[0.98]"
            aria-label="Open newsletter signup"
          >
            ✨ Get promos
          </button>
        ) : (
          <div className="fixed bottom-4 right-4 z-50 w-[92vw] max-w-[360px] sm:max-w-[400px]">
            <div className="bg-mutedbrown shadow-lg rounded-lg">
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-md md:text-xl font-semibold text-acloblue">
                    ✨ Psst… want promos?
                  </p>
                  <p className="mt-1 text-sm text-black-600">
                    Join our newsletter for exclusive offers and new releases -
                    straight to your inbox.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:cursor-pointer hover:opacity-70"
                  aria-label="Close newsletter popup"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="px-4 pb-4">
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    placeholder="Leave us your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-t border-l border-b border-acloblue rounded-l-md focus:outline-none transition-all p-3 text-sm text-acloblue"
                    required
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    disabled={loading}
                    className="
                      group
                      bg-acloblue text-white
                      border border-acloblue
                      px-3 py-3 rounded-r-md
                      hover:opacity-70 hover:cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsletterPopup;
