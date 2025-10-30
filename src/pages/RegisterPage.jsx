import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../RegisterPage.css";
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // ✅ All URLs are now taken only from .env
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // ✅ Fetch CSRF token from backend
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch(`${API_BASE}/csrf-token`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch CSRF token");
        const data = await res.json();
        setCsrfToken(data.csrfToken);
        console.log("✅ CSRF token loaded");
      } catch (err) {
        console.warn("⚠️ Failed to fetch CSRF token:", err.message);
      }
    };
    fetchCsrf();
  }, [API_BASE]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGeneralError("");
  };

  // ✅ Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorsObj = {};
        let generalMsg = "";

        if (Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            if (err.param) errorsObj[err.param] = err.message;
            else generalMsg = err.message || generalMsg;
          });
        }

        setFieldErrors(errorsObj);
        throw new Error(generalMsg || data.message || "Registration failed. Please try again.");
      }

      localStorage.setItem("token", data.data?.accessToken || "");
      setSuccess("🎉 Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setGeneralError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Create Account</h2>

        {generalError && <p className="error-message">{generalError}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            {fieldErrors.name && <p className="error-message">{fieldErrors.name}</p>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {fieldErrors.email && <p className="error-message">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Address (Region, City, Street, Zip, etc)"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
            {fieldErrors.address && <p className="error-message">{fieldErrors.address}</p>}
          </div>

          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
            {fieldErrors.phone && <p className="error-message">{fieldErrors.phone}</p>}
          </div>

          <div className="form-group password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {fieldErrors.password && <p className="error-message">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !csrfToken}>
            {loading ? "Registering..." : csrfToken ? "Register" : "Loading..."}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <button className="google-btn" type="button">
            <FaGoogle className="icon" /> Sign up with Google
          </button>
          <button className="facebook-btn" type="button">
            <FaFacebookF className="icon" /> Sign up with Facebook
          </button>
        </div>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <span className="auth-switch-link" onClick={() => navigate("/login")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
