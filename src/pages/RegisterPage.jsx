import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { parsePhoneNumberFromString } from "libphonenumber-js"; // ✅ Added
import "../RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  // ✅ Centralized form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Premium: Use environment variable with safe fallback
  const API_BASE =
    (process.env.REACT_APP_API_BASE_URL &&
      process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "")) ||
    (process.env.NODE_ENV === "production"
      ? "https://original-backend-bcme.onrender.com"
      : "http://localhost:8000");

  // ✅ Fetch CSRF Token on load
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch(`${API_BASE}/csrf-token`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch CSRF token");
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.warn("⚠️ Could not load CSRF token:", err.message);
      }
    };
    fetchCsrf();
  }, [API_BASE]);

  // ✅ Input change handler with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ Auto-detect and format any phone number to international (+country code)
  const formatPhoneNumber = (phone) => {
    try {
      if (!phone) return "";
      const cleaned = phone.trim();

      // Try parsing with auto-detect (default fallback "GH" Ghana)
      const parsed = parsePhoneNumberFromString(cleaned, "GH");

      if (parsed && parsed.isValid()) {
        return parsed.number; // standardized E.164 format (+233...)
      }

      // Fallback manual cleanup
      const fallback = cleaned.replace(/[\s()-]/g, "");
      if (fallback.startsWith("+")) return fallback;
      if (fallback.startsWith("0")) return "+233" + fallback.slice(1);
      return "+233" + fallback;
    } catch (error) {
      console.warn("Phone formatting error:", error.message);
      return phone;
    }
  };

  // ✅ Basic client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Enter a valid email address";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!form.phone.match(/^[0-9+]{10,15}$/))
      newErrors.phone = "Enter a valid phone number (10–15 digits)";
    return newErrors;
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please correct the highlighted fields");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(form.phone); // ✅ Auto-format before sending

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({ ...form, phone: formattedPhone }), // ✅ fixed line
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const serverErrors = {};
          data.errors.forEach((err) => {
            if (err.param) serverErrors[err.param] = err.message;
          });
          setErrors(serverErrors);
        }
        throw new Error(data.message || "Registration failed. Try again.");
      }

      localStorage.setItem("token", data.data?.accessToken || "");
      toast.success("🎉 Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Toaster position="top-center" />
      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="register-title">Create an Account</h2>
        <form className="register-form" onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              disabled={loading}
            />
            {errors.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Address (City, Region, etc)"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
              disabled={loading}
            />
            {errors.address && <p className="error-text">{errors.address}</p>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              disabled={loading}
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          <div className="form-group password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              disabled={loading}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <motion.button
            type="submit"
            className="btn-primary"
            disabled={loading || !csrfToken}
            whileTap={{ scale: 0.96 }}
          >
            {loading ? "Registering..." : csrfToken ? "Sign Up" : "Loading..."}
          </motion.button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-buttons">
          <button className="google-btn" type="button">
            <FaGoogle /> Sign up with Google
          </button>
          <button className="facebook-btn" type="button">
            <FaFacebookF /> Sign up with Facebook
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} className="switch-link">
            Login here
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
