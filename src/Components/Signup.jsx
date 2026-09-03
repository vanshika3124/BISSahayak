import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, ExternalLink } from "lucide-react";
import bisLogo from "../assets/BIS logo.png";
import OtpModal from "../components/OtpModal";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const API_BASE_URL = "https://backend-fkpu.onrender.com/api";

export default function Signup({ onSignIn }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);

  const validate = () => {
    const next = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!fullName.trim()) {
      next.fullName = "Full name is required.";
    }

    if (!email.trim()) {
      next.email = "Email address is required.";
    } else if (!EMAIL_PATTERN.test(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    } else if (!PASSWORD_PATTERN.test(password)) {
      next.password =
        "Password must include at least one letter and one number.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);

    return (
      !next.fullName &&
      !next.email &&
      !next.password &&
      !next.confirmPassword
    );
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    setApiError("");

    if (!validate()) return;

    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          username: fullName,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Registration successful.
      // Backend automatically sends OTP to email.
      setOtpOpen(true);
    } catch (err) {
      console.error("Signup error:", err);

      setApiError(
        err.response?.data?.message ||
          "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (data) => {
    if (data?.accessToken) {
      localStorage.setItem(
        "bis_access_token",
        data.accessToken
      );
    }

    setOtpOpen(false);

    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex md:w-1/2 relative bg-linear-to-br from-[#0b1b3a] via-[#0d3a52] to-[#0f7a6e] p-20 flex-col justify-between">

        <div className="flex items-center gap-2 text-white/90">
          <ShieldCheck
            className="w-8 h-8"
            strokeWidth={1.75}
          />

          <span className="text-md font-semibold tracking-wide">
            GOVT. OF INDIA
          </span>
        </div>

        <div>
          <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center mb-6 shadow-lg p-2.5">
            <img
              src={bisLogo}
              alt="BIS Sahayak"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-6xl font-semibold text-white leading-tight mb-3">
            Empowering
            <br />
            Indian Standards
          </h1>

          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            A secure, streamlined platform for authorized
            personnel and registered technical partners of
            the Bureau of Indian Standards.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex flex-col p-10 min-h-screen">

        {/* SECURITY BADGE */}
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <ShieldCheck
              className="w-4.5 h-4.5"
              strokeWidth={2}
            />

            Govt. Grade Security
          </span>
        </div>

        {/* FORM AREA */}
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">

          <h2 className="text-3xl font-bold text-neutral-900 mb-1">
            Create Account
          </h2>

          <p className="text-md text-neutral-500 mb-6">
            Register for your BIS Sahayak account
          </p>

          <form
            onSubmit={handleSignUp}
            className="space-y-4"
          >

            {/* API ERROR */}
            {apiError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3.5 py-2.5">
                {apiError}
              </div>
            )}

            {/* FULL NAME */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold tracking-wide text-neutral-600 mb-1.5"
              >
                FULL NAME
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Your full name"
                required
                maxLength={100}
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                aria-describedby={
                  errors.fullName
                    ? "fullName-error"
                    : undefined
                }
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                  errors.fullName
                    ? "border-red-400 focus-visible:ring-red-500"
                    : "border-neutral-300 focus-visible:ring-blue-600"
                }`}
              />

              {errors.fullName && (
                <p
                  id="fullName-error"
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wide text-neutral-600 mb-1.5"
              >
                EMAIL ADDRESS
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="name@bis.gov.in"
                required
                maxLength={254}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email
                    ? "email-error"
                    : undefined
                }
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                  errors.email
                    ? "border-red-400 focus-visible:ring-red-500"
                    : "border-neutral-300 focus-visible:ring-blue-600"
                }`}
              />

              {errors.email && (
                <p
                  id="email-error"
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wide text-neutral-600 mb-1.5"
              >
                PASSWORD
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                minLength={8}
                maxLength={64}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password
                    ? "password-error"
                    : undefined
                }
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                  errors.password
                    ? "border-red-400 focus-visible:ring-red-500"
                    : "border-neutral-300 focus-visible:ring-blue-600"
                }`}
              />

              {errors.password && (
                <p
                  id="password-error"
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold tracking-wide text-neutral-600 mb-1.5"
              >
                CONFIRM PASSWORD
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="••••••••"
                required
                minLength={8}
                maxLength={64}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                  errors.confirmPassword
                    ? "border-red-400 focus-visible:ring-red-500"
                    : "border-neutral-300 focus-visible:ring-blue-600"
                }`}
              />

              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-xs text-red-600 mt-1"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d234f] hover:bg-[#0a1c40] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl py-3 transition-colors"
            >
              {loading
                ? "Creating account..."
                : "Send OTP"}
            </button>

          </form>

          {/* OR */}
          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-neutral-200" />

            <span className="text-xs text-neutral-400">
              OR
            </span>

            <span className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* SIGN IN */}
          <button
            type="button"
            onClick={onSignIn}
            className="w-full bg-[#0d234f] hover:bg-[#0a1c40] text-white text-sm font-semibold rounded-xl py-3 transition-colors"
          >
            Already have an account? Sign In
          </button>

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between text-md pt-6">

          <a
            href="#"
            className="text-neutral-500 hover:text-neutral-800"
          >
            Trouble signing up?
          </a>

          <a
            href="https://www.bis.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-800"
          >
            Official BIS Portal

            <ExternalLink className="w-4 h-4" />
          </a>

        </div>

      </div>

      {/* OTP MODAL */}
      <OtpModal
        open={otpOpen}
        email={email}
        verifyUrl={`${API_BASE_URL}/auth/verify-email`}
        resendUrl={`${API_BASE_URL}/auth/register`}
        resendMethod="post"
        resendPayload={{
          username: fullName,
          email,
          password,
        }}
        onClose={() => setOtpOpen(false)}
        onVerified={handleOtpVerified}
      />

    </div>
  );
}