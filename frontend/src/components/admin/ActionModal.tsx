import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import type { PaymentProof } from "../../types/checkout";
import { cloudinaryImageUrl } from "../../constants/cloudinary";
import type { CancelRequest } from "../../types/order";

interface ActionModalProps {
  onClose: () => void;
  type: "paymentProof" | "cancelRequest";
  data: PaymentProof | CancelRequest;
  onAccept: () => void;
  onReject: () => void;
  loading: boolean;
}

const ActionModal = ({
  onClose,
  type,
  data,
  onAccept,
  onReject,
  loading,
}: ActionModalProps) => {
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-xl rounded-xl bg-white p-6 shadow-lg max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500"
        >
          <IoMdClose className="h-8 w-8 hover:text-gray-600 cursor-pointer" />
        </button>

        <h2 className="text-2xl text-acloblue font-semibold">
          {type === "paymentProof" ? "Payment Proof" : "Cancellation Request"}
        </h2>
        {type === "paymentProof" && "publicId" in data && (
          <>
            <div
              onClick={() => setPreviewOpen(true)}
              className="relative w-20 h-24 my-3 cursor-pointer group overflow-hidden"
            >
              <img
                src={cloudinaryImageUrl(data.publicId)}
                alt={data.publicId}
                className="w-full h-full border-2 rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Uploaded At
                </div>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                  {new Date(data.uploadedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}

        {type === "cancelRequest" && "reason" in data && (
          <>
            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                  Reason
                </div>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                  {data.reason}
                </p>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  Requested At
                </div>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                  {new Date(data.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-6">
          <button
            disabled={loading}
            onClick={onReject}
            className="flex-1 bg-red-500 text-white py-3 rounded cursor-pointer hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></div>
                Processing...
              </span>
            ) : (
              "Reject"
            )}
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={onAccept}
            className="flex-1 bg-green-500 rounded cursor-pointer hover:bg-green-600 text-white py-3 disabled:bg-green-500/50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processing...
              </span>
            ) : (
              "Accept"
            )}
          </button>
        </div>
        {previewOpen && type === "paymentProof" && "publicId" in data && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setPreviewOpen(false)} // click backdrop to close
          >
            <div className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center">
              <button
                onClick={() => setPreviewOpen(false)}
                className="absolute -top-10 right-0 text-white text-sm px-4 py-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                Close
              </button>

              <img
                src={cloudinaryImageUrl(data.publicId)}
                alt="Payment proof preview"
                className="w-full h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionModal;
