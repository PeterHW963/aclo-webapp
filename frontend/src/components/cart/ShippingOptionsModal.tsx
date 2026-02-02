import type { ShippingOption } from "../../types/checkout";
import { IoMdClose } from "react-icons/io";

interface ShippingOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  onSelectShipping: (option: ShippingOption) => void;
  gojekDisabled: boolean;
}

// helper function for changing courier option display
const getDisplayServiceName = (option: ShippingOption) => {
  // prioritize service code (more stable than names)
  if (option.courierCode.toLowerCase() === "jne") {
    if (option.courierServiceCode === "jtr") return "Cargo";
    if (option.courierServiceCode === "reg") return "Reguler";
  }
  // fallback: show the courier & service name
  return `${option.courierName} - ${option.courierServiceName}`;
};

const ShippingOptionsModal = ({
  isOpen,
  onClose,
  shippingOptions,
  selectedShipping,
  onSelectShipping,
  gojekDisabled,
}: ShippingOptionsModalProps) => {
  if (!isOpen) return null;

  const handleSelect = (option: ShippingOption) => {
    if (gojekDisabled && option.courierCode?.toLowerCase() === "gojek") return;
    onSelectShipping(option);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg border max-h-[80vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <IoMdClose className="h-6 w-6 hover:text-gray-600 cursor-pointer" />
        </button>

        <h3 className="text-xl font-semibold mb-4 tracking-tight text-acloblue">
          Select Shipping Method
        </h3>

        <p className="text-sm text-gray-600 mb-6">
          Choose your preferred shipping courier and service
        </p>

        <div className="space-y-3">
          {shippingOptions.map((option, index) => {
            const isGojekDisabled =
              gojekDisabled && option.courierCode?.toLowerCase() === "gojek";
            return (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  selectedShipping?.courierServiceCode ===
                  option.courierServiceCode
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${isGojekDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onClick={() => handleSelect(option)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xl font-semibold text-gray-900">
                          {getDisplayServiceName(option)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-700">{option.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xl font-semibold text-gray-900">
                      IDR {option.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {shippingOptions.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No shipping options available
          </p>
        )}
        {gojekDisabled && (
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-yellow-900">
              Gojek disabled for multiple Learning Towers
            </p>
            <p className="mt-1 text-sm text-yellow-800">
              If you purchase more than 1 Learning Tower, Gojek delivery will be
              disabled even if your address is within Jabodetabek.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingOptionsModal;
