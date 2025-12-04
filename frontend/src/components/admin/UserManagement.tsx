import { useState, type ChangeEvent, type FormEvent } from "react";

const UserManagement = () => {
	const users = [
		{
			_id: "someid",
			name: "John Doe",
			email: "john@example.com",
			role: "admin",
		},
	];
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "customer", // Default role
	});

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log(formData);
		// reset form after submission
		setFormData({
			name: "",
			email: "",
			password: "",
			role: "customer",
		});
	};
	const handleRoleChange = (userId: string, newRole: string) => {
		console.log({ id: userId, role: newRole });
	};
	const handleDeleteUser = (userId: string) => {
		if (window.confirm("Are you sure you want to delete this user?")) {
			console.log("deleteing user with ID: ", userId);
		}
	};
	return (
		<div className="max-w-7xl mx-auto p-6">
			<h2 className="text-2xl font-bold mb-4">User Management</h2>
			{/* Add new user form */}
			<div className="p-6 rounded-lg mb-6">
				<h3 className="text-lg font-bold mb-4">Add New User</h3>
				<form onSubmit={handleSubmit} className="">
					<div className="mb-4">
						<label className="block text-gray-700 mb-2">Name</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 mb-2">Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 mb-2">Password</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 mb-2">Name</label>
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
					<button
						type="submit"
						className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mt-2"
					>
						Add User
					</button>
				</form>
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
										onChange={(e) => handleRoleChange(user._id, e.target.value)}
										className="p-2 border rounded"
									>
										<option value="customer">Customer</option>
										<option value="admin">Admin</option>
									</select>
								</td>
								<td className="p-4">
									<button
										onClick={() => handleDeleteUser(user._id)}
										className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
									>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default UserManagement;
