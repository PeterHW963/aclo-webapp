import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { LoginPayload } from "../types/auth";
import { mergeCart } from "../redux/slices/cartSlice";
import { assets, cloudinaryImageUrl } from "../constants/cloudinary";
import Navbar from "../components/common/Navbar";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);

  // get redirect parameter and check if it's checkout or something else
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        // merge guest products with user products
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? `/checkout/${cart._id}` : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? `/checkout/${cart._id}` : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTestEmail = async () => {
    try {
      await axios.get("http://localhost:9000/api/test-email");
      alert("Email sent! Check your inbox.");
    } catch (error) {
      console.error(error);
      alert("Failed to send email");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginUser(formData));
    setFormData({ email: "", password: "" });
  };

  return (
    <>
      <Navbar />
      <div className="flex">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
          >
            <div className="flex justify-center mb-6">
              <h2 className="text-xl font-medium text-acloblue">Login</h2>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">
              Hey there! 👋
            </h2>
            {/* <p className="text-center mb-6">
            Enter your email and password to login
          </p> */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-acloblue"
                placeholder="Enter your email address"
              />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold">Password</label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-acloblue hover:opacity-80 cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-acloblue"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-acloblue text-white p-2 rounded-lg font-semibold mt-2 hover:opacity-80 transition cursor-pointer"
            >
              {loading ? "Loading..." : "Log In"}
            </button>
            <button
              type="button"
              onClick={handleTestEmail}
              className="w-full bg-green-600 text-white p-2 rounded-lg font-semibold mt-4 hover:opacity-80 transition"
            >
              Test Email Function
            </button>
            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirect)}`}
                className="text-acloblue hover:opacity-80 cursor-pointer"
              >
                Register
              </Link>{" "}
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-acloblue/90 hover:text-acloblue transition-colors cursor-pointer"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </form>
        </div>
        <div className="hidden md:block w-1/2 py-10">
          <div className="h-full flex flex-col justify-center items-center">
            <img
              src={cloudinaryImageUrl(assets.login.publicId)}
              alt={assets.login.alt}
              className="h-[750px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
