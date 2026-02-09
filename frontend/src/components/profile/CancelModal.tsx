import { useState } from "react";

interface CancelModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const CancelModal = ({ onClose, onSubmit }: CancelModalProps) => {
  const [draft, setDraft] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const reason = draft.trim();
    if (!reason) {
      setError("Please provide a reason for cancellation.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSubmit(reason);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit cancellation request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-125">
        <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>

        <textarea
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError("");
          }}
          rows={5}
          className="w-full rounded-lg border p-3 text-sm outline-none"
          placeholder="Please explain why you want to cancel this order."
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
            disabled={saving}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-acloblue/80 text-white hover:bg-acloblue text-sm cursor-pointer disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
