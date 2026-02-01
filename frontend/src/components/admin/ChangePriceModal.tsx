import { useEffect, useMemo, useState } from "react";

type VariantOption = {
  _id: string;
  sku: string;
  adminName: string;
  price: number;
  discountPrice?: number | null;
  countInStock?: number;
  isDefault?: boolean;
};

type ChangePriceModalProps = {
  productName: string;

  variants: VariantOption[];
  initialVariantId: string;

  onClose: () => void;
  onSave: (updates: {
    variantId: string;
    price: number;
    discountPrice: number | null;
    countInStock: number;
  }) => Promise<void> | void;
};

const formatVariantLabel = (v: VariantOption) => {
  return `${v.sku} - ${v.adminName}`;
};

const ChangePriceModal = ({
  productName,
  variants,
  initialVariantId,
  onClose,
  onSave,
}: ChangePriceModalProps) => {
  const [selectedVariantId, setSelectedVariantId] =
    useState<string>(initialVariantId);

  const selectedVariant = useMemo(
    () => variants.find((v) => v._id === selectedVariantId),
    [variants, selectedVariantId],
  );

  const [priceInput, setPriceInput] = useState<string>("");
  const [discountInput, setDiscountInput] = useState<string>("");
  const [stockInput, setStockInput] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedVariantId(initialVariantId);

    const v = variants.find((x) => x._id === initialVariantId);
    setPriceInput(v?.price != null ? String(v.price) : "");
    setDiscountInput(v?.discountPrice != null ? String(v.discountPrice) : "");
    setStockInput(v?.countInStock != null ? String(v.countInStock) : "");
    setSaving(false);
  }, [initialVariantId, variants]);

  useEffect(() => {
    if (!selectedVariant) return;

    setPriceInput(
      selectedVariant.price != null ? String(selectedVariant.price) : "",
    );
    setDiscountInput(
      selectedVariant.discountPrice != null
        ? String(selectedVariant.discountPrice)
        : "",
    );
    setStockInput(
      typeof selectedVariant.countInStock === "number"
        ? String(selectedVariant.countInStock)
        : "",
    );
  }, [selectedVariantId, selectedVariant]);

  const parsed = useMemo(() => {
    const price = Number(priceInput);
    const discountPrice =
      discountInput.trim() === "" ? null : Number(discountInput);

    const priceOk = Number.isFinite(price) && price >= 0;
    const discountOk =
      discountPrice === null ||
      (Number.isFinite(discountPrice) && discountPrice >= 0);

    const stock = Number(stockInput);
    const stockOk =
      Number.isFinite(stock) && Number.isInteger(stock) && stock >= 0;

    return { price, discountPrice, stock, priceOk, discountOk, stockOk };
  }, [priceInput, discountInput, stockInput]);

  const canSave =
    parsed.priceOk && parsed.discountOk && parsed.stockOk && !saving;

  const handleSave = async () => {
    console.log("save clicked");
    const payload = {
      variantId: selectedVariantId,
      price: parsed.price,
      discountPrice: parsed.discountPrice,
      countInStock: parsed.stock,
    };
    console.log("payload", payload);
    await onSave(payload);
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        variantId: selectedVariantId,
        price: parsed.price,
        discountPrice: parsed.discountPrice,
        countInStock: parsed.stock,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // esc to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-acloblue">
          Update Price & Stock
        </h3>
        <p className="text-sm text-gray-500 mt-1">{productName}</p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variant
          </label>
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-acloblue/20 disabled:opacity-60"
          >
            {variants.map((v) => (
              <option key={v._id} value={v._id}>
                {formatVariantLabel(v)}
                {v.isDefault ? " • Default" : ""}{" "}
                {typeof v.countInStock === "number"
                  ? `(Stock: ${v.countInStock})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (IDR)
            </label>
            <input
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-acloblue/20"
              placeholder="e.g. 2368000"
            />
            {!parsed.priceOk && (
              <p className="mt-1 text-xs text-red-600">
                Enter a valid non-negative number.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Price (optional)
            </label>
            <input
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-acloblue/20"
              placeholder="leave empty to remove discount"
            />
            {!parsed.discountOk && (
              <p className="mt-1 text-xs text-red-600">
                Enter a valid non-negative number.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Count in Stock
          </label>
          <input
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-acloblue/20"
            placeholder="e.g. 200"
          />
          {!parsed.stockOk && (
            <p className="mt-1 text-xs text-red-600">
              Enter a valid whole number (0 or more).
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-acloblue/30 text-acloblue py-2 hover:bg-acloblue/5 transition disabled:opacity-60 cursor-pointer"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-acloblue text-white py-2 font-semibold hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
            disabled={!canSave}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePriceModal;
