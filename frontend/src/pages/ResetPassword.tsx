import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { assets, cloudinaryImageUrl } from "../constants/cloudinary";
import type { ResetPasswordPayload } from "../types/auth";
import { validatePassword } from "../utils/passwordValidator";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { API_URL } from "../constants/api";

const ResetPassword = () => {
  const [formData, setFormData] = useState<ResetPasswordPayload>({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // /reset-password?token=xxxx&redirect=/checkout
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const redirect = params.get("redirect") || "/";

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      const validation = validatePassword(value);
      setPasswordErrors(validation.isValid ? [] : validation.errors);
    }
  };

  const validate = () => {
    if (!formData.password || !formData.confirmPassword) {
      return "Please fill in both password fields.";
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      return passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    if (!token) {
      return "Reset link is missing or invalid. Please request a new one.";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${API_URL}/api/users/reset-password/${token}`, {
        password: formData.password,
      });

      setSuccess("Your password is updated!");

      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      }, 1200);
    } catch (err: any) {
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        setError(err.response.data.errors.join(", "));
      } else {
        setError(
          err.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <LoadingOverlay show={loading} />
      <div className="flex">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm"
          >
            <div className="flex justify-center mb-6">
              <h2 className="text-xl font-medium text-acloblue">
                Reset password
              </h2>
            </div>

            <h2 className="text-2xl font-bold text-center mb-6">
              Create a new password
            </h2>

            {!token && (
              <div className="mb-4 rounded-md bg-yellow-50 text-yellow-800 px-3 py-2 text-sm">
                This reset link looks invalid or expired. Please request a new
                one.
              </div>
            )}

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
              <label className="block text-sm font-semibold mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 pr-11 border rounded focus:outline-acloblue ${
                    passwordErrors.length > 0 ? "border-red-300" : ""
                  }`}
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordErrors.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 space-y-1">
                  {passwordErrors.map((err, idx) => (
                    <li key={idx}>• {err}</li>
                  ))}
                </ul>
              )}
              {passwordErrors.length === 0 && formData.password && (
                <p className="mt-2 text-xs text-green-600">
                  ✓ Password meets requirements
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2 pr-11 border rounded focus:outline-acloblue"
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-acloblue text-white p-2 rounded-lg font-semibold mt-2 hover:opacity-80 transition disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remembered it?{" "}
              <Link to={`/login`} className="text-acloblue hover:opacity-80">
                Back to Login
              </Link>
            </p>
          </form>
        </div>

        <div className="hidden md:block w-1/2 py-10">
          <div className="h-full flex flex-col justify-center items-center">
            <img
              src={cloudinaryImageUrl(assets.reset.publicId)}
              alt={assets.reset.alt}
              className="h-[750px] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
