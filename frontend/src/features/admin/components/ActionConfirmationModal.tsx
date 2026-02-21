import { IoMdClose } from "react-icons/io";
import ReactMarkdown from "react-markdown";

// Modal for General action confirmation

interface ActionConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ActionConfirmationModal = ({
  onClose,
  onConfirm,
  loading,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ActionConfirmationModalProps) => {
  const baseBtn =
    "px-4 py-2 rounded-md flex items-center text-sm font-medium cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed";
  const cancelBtn = `${baseBtn} bg-slate-200 text-slate-700 hover:bg-slate-300`;
  const confirmBtn = `${baseBtn} bg-acloblue/80 text-white hover:bg-acloblue`;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center px-6"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500"
        >
          <IoMdClose className="h-8 w-8 hover:text-gray-600 cursor-pointer" />
        </button>

        <h2 className="text-2xl text-acloblue font-semibold mb-4 ">{title}</h2>
        <div className="text-gray-700 whitespace-pre-line">
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button disabled={loading} onClick={onClose} className={cancelBtn}>
            {cancelText}
          </button>
          <button disabled={loading} onClick={onConfirm} className={confirmBtn}>
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmationModal;
