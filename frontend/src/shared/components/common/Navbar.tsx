import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";

import Cartdrawer from "../layout/CartDrawer";
import { useAppSelector } from "../../../app/hooks";
import { assets, cloudinaryImageUrl } from "../../constants/cloudinary";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState<boolean>(false);
  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;

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
          <Link
            to="/"
            className="inline-flex items-center hover:cursor-pointer"
          >
            <img
              src={cloudinaryImageUrl(assets.logos.horizontal.publicId)}
              alt={assets.logos.horizontal.alt}
              className="h-7 sm:h-7 md:h-8 w-auto object-contain"
              loading="eager"
            />
          </Link>
        </div>
        {/* Center - navigation */}
        <div className="hidden md:flex items-center space-x-10">
          <Link
            to="/"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            HOME
          </Link>
          <Link
            to="/story"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            STORY
          </Link>
          <Link
            to="/shop"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            SHOP
          </Link>
          <Link
            to="/contact"
            className="text-ink hover:text-gray-600 uppercase font-light tracking-widest"
          >
            CONTACT
          </Link>
        </div>
        {/* Right - Icons */}
        <div className="flex items-center space-x-4">
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-ink px-2 py-1 rounded text-sm text-white"
            >
              Admin
            </Link>
          )}

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
            {cartItemCount > 0 && (
              <span className="absolute -top-1 bg-red-600 text-white text-xs rounded-full px-1 py-0.5">
                {cartItemCount}
              </span>
            )}
          </button>
          {/* Search */}
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
            {/* {CATEGORIES.map((category) => (
              <Link
                key={category}
                // to={`/collections/${category.toLowerCase().replace(/\s+/g, "-")}`}
                to="#"
                onClick={toggleNavDrawer}
                className="block hover:text-gray-600"
              >
                {category}
              </Link>
            ))} */}
            <ul>
              <Link to="/" className="block hover:text-gray-600">
                HOME
              </Link>
            </ul>
            <ul>
              <Link to="/story" className="block hover:text-gray-600">
                STORY
              </Link>
            </ul>
            <ul>
              <Link to="/shop" className="block hover:text-gray-600">
                SHOP
              </Link>
            </ul>
            <ul>
              <Link to="/contact" className="block hover:text-gray-600">
                CONTACT US
              </Link>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
