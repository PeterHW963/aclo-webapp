import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import type { User } from "../../types/user";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import {
  addUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../redux/slices/adminSlice";
// import type { Order } from "../../types/order";
import UserDetailsModal from "./UserDetailsModal";
import { fetchOrdersByUserId } from "../../redux/slices/adminOrderSlice";
import ActionConfirmationModal from "./ActionConfirmationModal";

interface NewUserFormData {
  name: string;
  email: string;
  password: string;
  role: User["role"]; // reuses role type from User
}

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { users, loading, error } = useAppSelector((state) => state.admin);
  const { userOrders, userOrdersLoading, userOrdersError } = useAppSelector(
    (state) => state.adminOrders,
  );

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === "admin") {
      dispatch(fetchUsers());
    }
  }, [dispatch, user]);

  const [formData, setFormData] = useState<NewUserFormData>({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(addUser(formData));
    // reset form after submission
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "customer",
    });
  };
  const handleRoleChange = (userId: string, newRole: User["role"]) => {
    dispatch(updateUser({ id: userId, role: newRole }));
  };
  const openDeleteModal = (u: User) => {
    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return; // optional: prevent closing while deleting
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      await dispatch(deleteUser({ id: userToDelete._id })).unwrap();
      closeDeleteModal();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {/* collapsible Add New User section */}
      <div className="mb-6 rounded-lg overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsAddOpen((v) => !v)}
          className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer select-none"
        >
          <h3 className="text-lg font-bold">Add New User</h3>
          <FiChevronDown
            className={[
              "text-gray-600 transition-transform duration-300",
              isAddOpen ? "rotate-180" : "rotate-0",
            ].join(" ")}
            size={18}
          />
        </div>
        {/* Add new user content */}
        <div
          id="add-user-panel"
          className={[
            "transition-all duration-300 ease-in-out",
            "overflow-hidden",
            isAddOpen ? "max-h-130 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 hover:cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* User list management */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                  {user.name}
                </td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user._id, e.target.value as User["role"])
                    }
                    className="p-2 border rounded"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={async () => {
                      setUserToView(user);
                      dispatch(fetchOrdersByUserId({ userId: user._id }));
                      setIsDetailsOpen(true);
                    }}
                    className="bg-acloblue text-white px-4 py-2 rounded hover:bg-acloblue/80 hover:cursor-pointer"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDetailsOpen && userToView && (
        <UserDetailsModal
          user={userToView}
          orders={userOrders}
          onClose={() => {
            setIsDetailsOpen(false);
            setUserToView(null);
          }}
          loading={userOrdersLoading}
          error={userOrdersError}
        />
      )}
      {isDeleteModalOpen && userToDelete && (
        <ActionConfirmationModal
          onClose={closeDeleteModal}
          onConfirm={confirmDeleteUser}
          loading={deleteLoading}
          title="Delete user?"
          message={`Are you sure you want to delete **${userToDelete.name}** (${userToDelete.email})?\n**This action cannot be undone.**`}
          confirmText="Yes, delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default UserManagement;
