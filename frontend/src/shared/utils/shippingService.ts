import type { ShippingOption } from "../types/checkout";

// helper function for changing courier option display
export const getDisplayServiceName = (option: ShippingOption) => {
  // prioritize service code (more stable than names)
  if (option.courierCode.toLowerCase() === "jne") {
    if (option.courierServiceCode === "jtr") return "Cargo";
    if (option.courierServiceCode === "reg") return "Reguler";
  }
  // in general, show the courier & service name
  return `${option.courierName} - ${option.courierServiceName}`;
};
