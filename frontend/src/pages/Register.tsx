import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { RegisterPayload } from "../types/auth";
import { assets, cloudinaryImageUrl } from "../constants/cloudinary";
import Navbar from "../components/common/Navbar";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { validatePassword } from "../utils/passwordValidator";

const Register = () => {
  const [formData, setFormData] = useState<RegisterPayload>({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  useEffect(() => {
    // redirect user to login if they are logged in
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      const validation = validatePassword(value);
      setPasswordErrors(validation.isValid ? [] : validation.errors);
    }
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return "Please fill in all fields.";
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      return passwordValidation.errors[0];
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
    try {
      await dispatch(registerUser(formData)).unwrap();
      setShowEmailDialog(true);
      setFormData({ name: "", email: "", password: "" });
      setPasswordErrors([]);
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors.join(", "));
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <LoadingOverlay show={loading} />

      {showEmailDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg border">
            <button
              type="button"
              onClick={() => {
                setShowEmailDialog(false);
                navigate("/");
              }}
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
              Please click on the link to verify your account and complete your
              registration. The link will expire in 24 hours.
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 pr-11 border rounded ${
                    passwordErrors.length > 0 ? "border-red-300" : ""
                  }`}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  required
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
              className="h-187.5 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
