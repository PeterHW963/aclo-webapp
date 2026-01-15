import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import axios from "axios";
import { API_URL, getAuthHeader } from "../../constants/api";
import LoadingOverlay from "../common/LoadingOverlay";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import { fetchCheckoutById } from "../../redux/slices/checkoutSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import Navbar from "../common/Navbar";

const REDIRECT_AFTER_MS = 2000;

// payment countdown
const TEST_MODE = true;
const COUNTDOWN_MS = TEST_MODE
  ? 1 * 60 * 1000 // testing
  : 6 * 60 * 60 * 1000; // prod

const Payment = () => {
  const { checkoutId } = useParams<{ checkoutId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    checkout,
    loading: checkoutLoading,
    error,
  } = useAppSelector((state) => state.checkout);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [screenshot, setScreenshot] = useState<string>(""); // cloudinary publicId
  const [uploadedFileName, setUploadedFileName] = useState<string>(""); // string to show to users
  const [note, setNote] = useState<string>("");

  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [expired, setExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!checkoutId) {
      navigate("/");
      return;
    }

    // fetch if missing OR wrong checkout in redux
    if (!checkout?._id || checkout._id !== checkoutId) {
      dispatch(fetchCheckoutById({ checkoutId }));
    }
  }, [checkoutId, checkout?._id, dispatch, navigate]);

  useEffect(() => {
    if (!checkoutId) return;
    if (checkoutLoading) return;

    // after loading finishes, if we still don't have the checkout, redirect
    if (!checkout || checkout._id !== checkoutId) {
      const t = setTimeout(() => navigate("/"), REDIRECT_AFTER_MS);
      return () => clearTimeout(t);
    }
  }, [checkoutId, checkoutLoading, checkout?._id, navigate]);

  const deleteByPublicId = async (publicId: string) => {
    await axios.delete(`${API_URL}/api/upload`, {
      data: { publicId },
    });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "payments");

    try {
      setUploading(true);

      if (screenshot) {
        try {
          setDeleting(true);
          await deleteByPublicId(screenshot);
        } catch (err) {
          console.error(err);
        } finally {
          setDeleting(false);
        }
      }
      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setScreenshot(data.publicId);
      setUploadedFileName(file.name);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!screenshot) return;

    try {
      setDeleting(true);
      await deleteByPublicId(screenshot);

      // Clear UI state
      setScreenshot("");
      setUploadedFileName("");
      setPreviewOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!checkout?._id) return;

    try {
      setSubmitting(true);

      const { data } = await axios.post(
        `${API_URL}/api/checkout/${checkout._id}/submit-proof`,
        { publicId: screenshot, note: note }, // optional: send proof id to backend
        { headers: getAuthHeader() }
      );
      dispatch(clearCart());
      navigate(`/order/${data.orderId}/confirmation`);
    } catch (err) {
      console.error(err);
      // optionally show toast / set local error message
    } finally {
      setSubmitting(false);
    }
  };

  // payment countdown timer
  const clamp = (n: number) => Math.max(0, n);

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (x: number) => String(x).padStart(2, "0");

    if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  useEffect(() => {
    if (!checkout?.createdAt) return;

    const createdAtMs = new Date(checkout.createdAt).getTime();
    const expiresAtMs = createdAtMs + COUNTDOWN_MS;

    const tick = () => {
      const now = Date.now();
      const remaining = clamp(expiresAtMs - now);

      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        setExpired(true);
      } else {
        setExpired(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [checkout?.createdAt]);

  if (error) return <p>Error: {error}</p>;

  if (!checkoutLoading && checkout && expired) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center px-4 py-10">
          <div className="max-w-2xl w-full border-black border-2 rounded-lg mx-auto py-10 px-6 tracking-tighter">
            <div className="text-3xl uppercase mb-4 text-acloblue">
              Checkout Expired
            </div>

            <div className="text-lg text-gray-700 mb-6">
              This checkout has been cancelled because the payment window has
              ended. Please place your order again to get a new payment session.
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-acloblue/80 text-white py-3 rounded hover:bg-acloblue transition cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center px-4 py-10">
        <LoadingOverlay show={checkoutLoading} />
        <div className="max-w-4xl border-black border-2 rounded-lg mx-auto py-10 px-6 tracking-tighter">
          <div className="text-3xl uppercase mb-4 text-acloblue">
            Payment Instructions
          </div>
          {timeLeftMs !== null && !expired && (
            <div className="mb-4 flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
              <div className="text-md text-gray-600">
                Please upload your payment proof within:
              </div>
              <div className="text-xl font-semibold text-acloblue">
                {formatCountdown(timeLeftMs)}
              </div>
            </div>
          )}

          <div className="text-xl mb-2">
            Your total purchase cost is{" "}
            <span className="font-semibold">
              IDR {(checkout?.totalPrice ?? 0).toLocaleString("id-ID")}
            </span>
            .
          </div>
          <div className="text-xl mb-6">
            Please do a bank transfer to this account xxxxxxxxxxxxx and upload a
            screenshot of the proof of transaction. If a proof of transaction is
            not provided or is deemed invalid, we cannot process your order.
          </div>
          {uploading && <p>Uploading image...</p>}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-acloblue/80 text-white py-2 px-4 rounded hover:bg-acloblue cursor-pointer"
          >
            Choose file
          </button>

          <span className="ml-3 text-sm text-gray-600">
            {uploadedFileName ? uploadedFileName : "No file selected"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleImageUpload}
            className="hidden"
          />
          {screenshot && (
            <div>
              <p className="text-base text-gray-600 mt-2 mb-2">
                Uploaded screenshot
              </p>
              <div className="relative inline-block group">
                <img
                  src={cloudinaryImageUrl(screenshot)}
                  alt="Uploaded screenshot"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                  onClick={() => setPreviewOpen(true)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScreenshot();
                  }}
                  disabled={deleting}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-gray-200 text-black disabled:opacity-50"
                >
                  x
                </button>
                {deleting && (
                  <div className="absolute inset-0 rounded-lg bg-black/30 flex items-center justify-center text-white text-xs">
                    Deleting...
                  </div>
                )}
              </div>
            </div>
          )}
          {previewOpen && screenshot && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              onClick={() => setPreviewOpen(false)} // click backdrop to close
            >
              <div
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
              >
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="absolute -top-10 right-0 text-white text-sm px-4 py-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
                >
                  Close
                </button>

                <img
                  src={cloudinaryImageUrl(screenshot)}
                  alt="Uploaded screenshot preview"
                  className="w-full max-h-[85vh] object-contain rounded-lg"
                />
              </div>
            </div>
          )}
          <div className="mt-6 mb-4">
            <div className="block font-semibold mb-2 mt-2">
              Note to seller (optional):
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={2}
              required
            ></textarea>
          </div>
          <div className="text-base text-gray-500 mt-4 mb-2">
            After payment, we will confirm your transaction and create your
            order within 1-2 business days.
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              expired || screenshot.length === 0 || submitting || !checkout?._id
            }
            className="w-full bg-acloblue/80 text-white py-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-acloblue transition cursor-pointer"
          >
            {expired ? "Expired" : submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Payment;
