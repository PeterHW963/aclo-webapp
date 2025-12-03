import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./components/layout/UserLayout";
import Home from "./pages/Home";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CollectionPage from "./pages/CollectionPage";

function App() {
	return (
		<BrowserRouter>
			<Toaster position="top-right" />
			<Routes>
				<Route path="/" element={<UserLayout />}>
					{/* User Layout */}
					<Route index element={<Home />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="profile" element={<Profile />} />
					{/* anything after a colon is a dynamic route */}
					<Route path="collections/:collection" element={<CollectionPage />} />
				</Route>
				<Route>{/* Admin Layout */}</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
