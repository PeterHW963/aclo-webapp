import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import MyOrdersPage from "./MyOrdersPage";
import { useEffect, useState } from "react";
import { logoutAndReset } from "../utils/logoutReset";
import { resendVerification } from "../redux/slices/authSlice";
import { toast } from "sonner";

const Profile = () => {
	const { user } = useAppSelector((state) => state.auth);
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [sendingVerification, setSendingVerification] = useState(false);

	useEffect(() => {
		if (!user) {
			// if user isn't logged in
			navigate("/login");
		}
	}, [user, navigate]);

	if (!user) {
		return null;
	}

	const handleLogout = () => {
		dispatch(logoutAndReset());
		navigate("/login");
	};

	const handleResendVerification = async () => {
		setSendingVerification(true);
		try {
			await dispatch(resendVerification()).unwrap();
			toast.success("Verification email sent! Check your inbox to complete verification.");
		} catch (err: any) {
			toast.error("Failed to send verification email. Please try again.");
		} finally {
			setSendingVerification(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<div className="grow container mx-auto p-4 md:p-6">
				<div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
					{/* Account details section on the left */}
					<div className="w-full md:w-1/3 lg:w-1/4 shadow-md rounded-lg p-6">
						<h1 className="text-2xl md:text-3xl font-bold mb-4">{user.name}</h1>
						<p className="text-lg text-gray-600 mb-4">{user.email}</p>
						
						<div className="mb-4 flex items-center gap-2">
							<span className="text-sm font-semibold">Status:</span>
							{user.isVerified ? (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
									Verified
								</span>
							) : (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
									Unverified
								</span>
							)}
						</div>
						
						{!user.isVerified && (
							<button
								onClick={handleResendVerification}
								disabled={sendingVerification}
								className="w-full mb-4 bg-acloblue text-white py-2 px-4 rounded hover:opacity-90 transition disabled:opacity-60"
							>
								{sendingVerification ? "Sending..." : "Verify My Account"}
							</button>
						)}
						
						<button
							onClick={handleLogout}
							className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
						>
							Logout
						</button>
					</div>
					{/* Orders table on the right */}
					<div className="w-full md:w-2/3 lg:w-3/4">
						<MyOrdersPage />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
