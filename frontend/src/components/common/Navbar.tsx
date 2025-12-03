import {
	HiOutlineUser,
	HiOutlineShoppingBag,
	HiBars3BottomRight,
} from "react-icons/hi2";
import { Link } from "react-router-dom";
import Searchbar from "./Searchbar";
import Cartdrawer from "../layout/CartDrawer";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { CATEGORIES } from "../../constants/categories";

const Navbar = () => {
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
	const [navDrawerOpen, setNavDrawerOpen] = useState<boolean>(false);

	const toggleCartDrawer = () => {
		setDrawerOpen(!drawerOpen);
	};

	const toggleNavDrawer = () => {
		setNavDrawerOpen(!navDrawerOpen);
	};

	return (
		<>
			<nav className="container mx-auto flex justify-between py-4 px-6">
				{/* Left - logo */}
				<div>
					<Link to="/" className="text-2xl font-medium hover:cursor-pointer">
						Aclo
					</Link>
				</div>
				{/* Center - navigation */}
				<div className="hidden md:flex items-center space-x-6">
					<Link
						to="/collections/all"
						className="text-black hover:text-gray-600 font-medium uppercase"
					>
						Learning Tower
					</Link>
					<Link
						to="#"
						className="text-black hover:text-gray-600 font-medium uppercase"
					>
						Stool
					</Link>
					<Link
						to="#"
						className="text-black hover:text-gray-600 font-medium uppercase"
					>
						Utensils
					</Link>
				</div>
				{/* Right - Icons */}
				<div className="flex items-center space-x-4">
					<Link
						to="/profile"
						className="hover:text-gray-600 hover:cursor-pointer"
					>
						<HiOutlineUser className="h-6 w-6" />
					</Link>
					<button
						onClick={toggleCartDrawer}
						className="relative hover:text-gray-600 hover:cursor-pointer"
					>
						<HiOutlineShoppingBag className="h-6 w-6" />
						<span className="absolute -top-1 bg-red-600 text-white text-xs rounded-full px-1 py-0.5">
							4
						</span>
					</button>
					{/* Search */}
					<Searchbar />
					<button onClick={toggleNavDrawer} className="md:hidden">
						<HiBars3BottomRight className="h-6 w-6 hover:text-gray-600" />
					</button>
				</div>
			</nav>
			<Cartdrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />
			{/* Mobile navigation */}
			<div
				className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
					navDrawerOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex justify-end p-4">
					<button onClick={toggleNavDrawer}>
						<IoMdClose className="h-6 w-6 text-gray-600" />
					</button>
				</div>
				<div className="p-4">
					<h2 className="text-xl font-semibold mb-4">Menu</h2>
					<nav className="space-y-4">
						{CATEGORIES.map((category) => (
							<Link
								key={category}
								// to={`/collections/${category.toLowerCase().replace(/\s+/g, "-")}`}
								to="#"
								onClick={toggleNavDrawer}
								className="block hover:text-gray-600"
							>
								{category}
							</Link>
						))}
					</nav>
				</div>
			</div>
		</>
	);
};

export default Navbar;
