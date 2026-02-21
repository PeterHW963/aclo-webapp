import type { MouseEvent } from "react";
import { COLOR_SWATCH } from "../../../shared/constants/colors";

type OptionSwatchProps = {
  optionKey: string;
  value: string;
  isSelected: boolean;
  onSelect: (e: MouseEvent, key: string, value: string) => void;
};

const OptionSwatch = ({
  optionKey,
  value,
  isSelected,
  onSelect,
}: OptionSwatchProps) => {
  const isColor = optionKey === "color";
  const swatchHex = isColor ? COLOR_SWATCH[value] : undefined;

  return (
    <button
      type="button"
      onClick={(e) => onSelect(e, optionKey, value)}
      aria-label={`${optionKey}: ${value}`}
      title={value}
      style={isColor && swatchHex ? { backgroundColor: swatchHex } : undefined}
      className={[
        "relative inline-flex items-center justify-center",
        "h-8 w-8 rounded-full",
        "transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-acloblue focus-visible:ring-offset-2",
        isColor ? "border" : "border border-gray-200 bg-white",
        isSelected
          ? "ring-2 ring-acloblue ring-offset-2 border-transparent"
          : "border-gray-400 hover:border-gray-800",
      ].join(" ")}
    >
      {!isColor && (
        <span className="text-[10px] font-semibold text-gray-700">
          {value.slice(0, 1).toUpperCase()}
        </span>
      )}
    </button>
  );
};

export default OptionSwatch;
