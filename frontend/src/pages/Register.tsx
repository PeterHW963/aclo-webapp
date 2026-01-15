import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { RegisterPayload } from "../types/auth";
import { mergeCart } from "../redux/slices/cartSlice";
import { assets, cloudinaryImageUrl } from "../constants/cloudinary";
import Navbar from "../components/common/Navbar";
import { XMarkIcon } from "@heroicons/react/24/solid";

const Register = () => {
  const [formData, setFormData] = useState<RegisterPayload>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, guestId, loading } = useAppSelector((state) => state.auth);
  const { cart } = useAppSelector((state) => state.cart);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const isCheckoutRedirect = redirect.includes("checkout");

  useEffect(() => {
    if (user) {
      if (cart?.products.length > 0 && guestId) {
        dispatch(mergeCart({ guestId, user })).then(() => {
          navigate(isCheckoutRedirect ? "/checkout" : "/");
        });
      } else {
        navigate(isCheckoutRedirect ? "/checkout" : "/");
      }
    }
  }, [user, guestId, cart, navigate, isCheckoutRedirect, dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return "Please fill in all fields.";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmittedEmail(formData.email);
    await dispatch(registerUser(formData));
    setShowEmailDialog(true);
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <>
      <Navbar />

      {showEmailDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEmailDialog(false)}
          />

          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg border">
            <button
              type="button"
              onClick={() => setShowEmailDialog(false)}
              aria-label="Close dialog"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-ink text-center">
              Check your email
            </h3>

            <p className="mt-3 text-center text-sm text-gray-600">
              We sent a link to{" "}
              <span className="font-semibold text-ink">{submittedEmail}</span>.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to={`/login?redirect=${encodeURIComponent(redirect)}`}
                className="w-full text-center rounded-lg bg-acloblue px-4 py-2.5 text-white font-semibold hover:opacity-90 transition"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
          >
            <div className="flex justify-center mb-6">
              <h2 className="text-xl font-medium text-acloblue">
                Create Account
              </h2>
            </div>

            <h2 className="text-2xl font-bold text-center mb-6 text-ink">
              Hey there! 👋
            </h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-acloblue"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-acloblue"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter your password"
                autoComplete="new-password"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Must be at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-acloblue text-white p-2 rounded-lg font-semibold mt-2 hover:opacity-80 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Loading..." : "Sign Up"}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirect)}`}
                className="text-acloblue hover:opacity-80"
              >
                Login
              </Link>{" "}
              •{" "}
              <Link to={`/`} className="text-acloblue hover:opacity-80">
                Back to Home
              </Link>
            </p>
          </form>
        </div>

        <div className="hidden md:block w-1/2 py-10">
          <div className="h-full flex flex-col justify-center items-center">
            <img
              src={cloudinaryImageUrl(assets.register.publicId)}
              alt={assets.register.alt}
              className="h-[750px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
