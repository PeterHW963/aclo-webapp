import Footer from "../common/Footer";
import Header from "../common/Header";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
	return (
		<>
			{/* Header */}
			<Header />
			{/* Main content */}
			<main>
				{/* Outlet can change child component depending on route we access */}
				<Outlet></Outlet>
			</main>
			{/* Footer */}
			<Footer />
		</>
	);
};

export default UserLayout;
