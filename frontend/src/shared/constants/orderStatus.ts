import type { OrderStatus } from "../types/order";

const STATUS_STYLES: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  // in prog orders
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  },
  processing: {
    label: "Processing",
    className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  },
  shipping: {
    label: "Shipping",
    className: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
  },
  cancelling: {
    label: "Cancelling",
    className: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  },

  // resolved orders
  rejected: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 ring-1 ring-green-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  },

  // failed orders - admin manually change to these from Delivered
  returned: {
    label: "Returned",
    className: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  },
  refunded: {
    label: "Refunded",
    className: "bg-fuchsia-100 text-fuchsia-800 ring-1 ring-fuchsia-200",
  },
  exchanged: {
    label: "Exchanged",
    className: "bg-teal-100 text-teal-800 ring-1 ring-teal-200",
  },
};

export const getStatusBadge = (status: OrderStatus) => {
  return STATUS_STYLES[status ?? "pending"];
};
