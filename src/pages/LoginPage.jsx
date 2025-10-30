import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import "../index.css";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://original-backend-8b5r.onrender.com";

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate]);

  // ✅ Fetch CSRF token
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
        console.error("Failed to fetch CSRF token", err);
      }
    };
    fetchCsrf();
  }, [API_BASE]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");
    setLoading(true);

    try {
      const res = await login(form.email, form.password, csrfToken);

      // ✅ Normalize avatar URL
      if (res.avatar && !res.avatar.startsWith("http")) {
        const cleanPath = res.avatar.startsWith("/")
          ? res.avatar
          : `/uploads/avatars/${res.avatar}`;
        res.avatar = `${API_BASE}${cleanPath}`;
      }

      setUser(res);

      // ✅ Redirect user to saved path (if came from cart)
      const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors || [];
      const errorsObj = {};
      errors.forEach((error) => {
        if (error.param) errorsObj[error.param] = error.message;
      });
      setFieldErrors(errorsObj);
      setGeneralError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>

        {generalError && <p className="error-message">{generalError}</p>}

        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="current-password"
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {fieldErrors.password && (
              <p className="error-message">{fieldErrors.password}</p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch-text">
          New user?{" "}
          <span className="auth-switch-link" onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="social-login">
          <button className="google-btn" type="button">
            <FaGoogle className="icon" /> Login with Google
          </button>
          <button className="facebook-btn" type="button">
            <FaFacebookF className="icon" /> Login with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
