import { FaEye } from "react-icons/fa6";
import type { Checkout } from "../../../shared/types/checkout";

const CheckoutsTable = ({
  title,
  data,
  emptyText,
  onViewDetails,
}: {
  title: string;
  data: Checkout[];
  emptyText: string;
  onViewDetails: (checkoutId: string) => void;
}) => (
  <div className="rounded-lg bg-white shadow-md sm:rounded-lg">
    <div className="px-4 py-3 font-semibold text-slate-800">{title}</div>

    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-gray-500">
        <thead className="bg-gray-100 text-xs uppercase text-gray-700">
          <tr>
            <th className="py-3 px-4">Checkout ID</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Created At</th>
            <th className="py-3 px-4">Expires At</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                  {c._id}
                </td>
                <td className="p-4">
                  {typeof c.user === "string" ? c.user : c.user?.name}
                </td>
                <td className="p-4">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  {new Date(c.expiresAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => onViewDetails(c._id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded hover:bg-gray-100 cursor-pointer"
                    title="View details"
                  >
                    <FaEye className="h-6 w-6" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default CheckoutsTable;
