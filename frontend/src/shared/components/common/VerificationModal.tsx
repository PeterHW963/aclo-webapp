import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";

import { useAppDispatch } from "../../../app/hooks";
import { resendVerification } from "../../../features/auth/slices/authSlice";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationModal = ({ isOpen, onClose }: VerificationModalProps) => {
  const dispatch = useAppDispatch();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSent(false);
      setError(null);
      setSending(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResend = async () => {
    setSending(true);
    setError(null);
    try {
      await dispatch(resendVerification()).unwrap();
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg border">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <IoMdClose className="h-6 w-6 hover:text-gray-600 cursor-pointer" />
        </button>

        <h3 className="text-lg font-semibold text-ink text-center mb-3">
          Email Verification Required
        </h3>

        {!sent ? (
          <>
            <p className="text-center text-sm text-gray-600 mb-6">
              You need to verify your email address before you can proceed to
              checkout. Click 'Verify My Account' below to receive a new
              verification link.
            </p>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResend}
                disabled={sending}
                className="w-full text-center rounded-lg bg-acloblue px-4 py-2.5 text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {sending ? "Sending..." : "Verify My Account"}
              </button>
              <button
                onClick={onClose}
                className="w-full text-center rounded-lg border border-gray-300 px-4 py-2.5 text-ink font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center text-sm text-gray-600 mb-6">
              Verification email sent! Please check your inbox.
            </p>
            <button
              onClick={onClose}
              className="w-full text-center rounded-lg bg-acloblue px-4 py-2.5 text-white font-semibold hover:opacity-90 transition"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default VerificationModal;
