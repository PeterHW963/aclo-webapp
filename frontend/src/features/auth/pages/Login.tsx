import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";

import { loginUser } from "../slices/authSlice";
import { mergeCart } from "../../cart/slices/cartSlice";

import type { LoginPayload } from "../../../shared/types/auth";
import {
  assets,
  cloudinaryImageUrl,
} from "../../../shared/constants/cloudinary";

import Navbar from "../../../shared/components/common/Navbar";

const Login = () => {
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
    setError(null);
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(formData)).unwrap();
      toast.success("You've successfully logged in!");
      setFormData({ email: "", password: "" });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    }
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
            {error && (
              <div className="mb-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 pr-11 border rounded focus:outline-acloblue"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
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
