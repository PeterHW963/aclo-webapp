import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";

interface TrackingModalProps {
  initialValue: string;
  onClose: () => void;
  action: "edit" | "add";
  onSave: (value: string) => void;
  onCancel: () => void;
  loading: boolean;
}

const TrackingModal = ({
  initialValue,
  onClose,
  action,
  onSave,
  onCancel,
  loading,
}: TrackingModalProps) => {
  const [draft, setDraft] = useState(initialValue);
  useEffect(() => {
    setDraft(initialValue);
  }, [initialValue]);

  // SEND EMAIL TO USER
  const handleSave = () => {
    if (!draft.trim()) return; // optional: prevent empty save
    onSave(draft.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500"
        >
          <IoMdClose className="h-8 w-8 hover:text-gray-600 cursor-pointer" />
        </button>
        <h4 className="text-2xl text-acloblue font-semibold mb-4">
          {action === "add" ? "Add" : "Edit"} Tracking Link
        </h4>

        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border p-2 text-sm outline-none mb-4"
          placeholder="Paste courier tracking link here..."
        />

        <div className="flex justify-end mt-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-acloblue/80 text-white cursor-pointer hover:bg-acloblue text-sm disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
