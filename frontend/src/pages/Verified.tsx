import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useAppDispatch } from "../redux/hooks";
import { verifyEmail } from "../redux/slices/authSlice";

const Verified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");

  const hasVerifiedRef = useRef(false); // to ensure useEffect runs only once

  const redirect = new URLSearchParams(location.search).get("redirect") || "/";
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (hasVerifiedRef.current) return; 
    
    if (!token) {
      setVerificationStatus("error");
      return;
    }

    const verify = async () => {
      try {
        console.log("Verifying email with token:", token);
        hasVerifiedRef.current = true;
        await dispatch(verifyEmail(token)).unwrap();
        console.log("Email verified successfully");
        setVerificationStatus("success");
        setTimeout(() => {
          navigate(redirect);
        }, 2000);
      } catch (err) {
        console.error("Verification failed:", err);
        setVerificationStatus("error");
      }
    };

    verify();
  }, [token, dispatch, navigate, redirect]);

  useEffect(() => {
    if (verificationStatus === "success") {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          navigate(redirect);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [navigate, redirect, verificationStatus]);

  if (verificationStatus === "pending") {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 py-14 sm:py-16">
          <div className="mx-auto w-full max-w-md rounded-xl bg-white border shadow-sm p-8 text-center">
            <div className="animate-spin mx-auto h-12 w-12 rounded-full border-4 border-gray-200 border-t-acloblue"></div>
            <h1 className="mt-5 text-2xl font-bold text-ink">Verifying your email...</h1>
            <p className="mt-3 text-sm text-gray-600">Please wait while we verify your account.</p>
          </div>
        </main>
      </>
    );
  }

  if (verificationStatus === "error") {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 py-14 sm:py-16">
          <div className="mx-auto w-full max-w-md rounded-xl bg-white border shadow-sm p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <XMarkIcon className="h-7 w-7 text-red-600" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-ink">Verification failed</h1>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {"The verification link is invalid or has expired. Please try again."}
            </p>

            <div className="mt-7 space-y-3">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-acloblue px-4 py-2.5 text-white font-semibold hover:opacity-90 transition"
              >
                Back to login
              </Link>
              <Link
                to="/"
                className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-ink font-semibold hover:bg-gray-50 transition"
              >
                Go to home
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-16 xl:px-24 2xl:px-32 py-14 sm:py-16">
        <div className="mx-auto w-full max-w-md rounded-xl bg-white border shadow-sm p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <CheckCircleIcon className="h-7 w-7 text-green-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-ink">Email verified!</h1>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Your email has been successfully verified. You will be redirected in a moment.
          </p>

          <div className="mt-7">
            <Link
              to={redirect}
              className="inline-flex w-full items-center justify-center rounded-lg bg-acloblue px-4 py-2.5 text-white font-semibold hover:opacity-90 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default Verified;
