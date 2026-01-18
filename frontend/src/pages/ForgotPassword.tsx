import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets, cloudinaryImageUrl } from "../constants/cloudinary";
import type { ForgotPasswordPayload } from "../types/auth";
import Navbar from "../components/common/Navbar";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { API_URL } from "../constants/api";

const ForgotPassword = () => {
  const [formData, setFormData] = useState<ForgotPasswordPayload>({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${API_URL}/api/users/forgot-password`, {
        email: formData.email,
      });

      setSuccess(
        "If an account exists for this email, we've sent a reset email."
      );

      // navigate back to login
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      }, 20000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
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
              <h2 className="text-xl font-medium text-acloblue">
                Forgot password
              </h2>
            </div>

            <h2 className="text-2xl font-bold text-center mb-6">
              No worries 👋
            </h2>
            <p className="text-center mb-6">
              We will send you an email to reset your password.
            </p>

            {success && (
              <div className="mb-4 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">
                {success}
              </div>
            )}
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
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-acloblue text-white p-2 rounded-lg font-semibold mt-2 hover:opacity-80 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
            <div className="mt-6 flex justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-acloblue/90 hover:text-acloblue transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <div className="hidden md:block w-1/2 py-10">
          <div className="h-full flex flex-col justify-center items-center">
            <img
              src={cloudinaryImageUrl(assets.forget.publicId)}
              alt={assets.forget.alt}
              className="h-[750px] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
