import axios from "axios";

// ✅ Ensure base URL has no trailing slash
const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

const API = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // include cookies for auth/csrf if needed
});

// ✅ Automatically attach token to requests
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ Optional: intercept responses to handle token expiry or CSRF errors
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn("Unauthorized — possible token expiry.");
      } else if (status === 403 && error.response.data?.message?.includes("csrf")) {
        console.warn("CSRF validation failed — refresh token or re-login may be needed.");
      }
    }
    return Promise.reject(error);
  }
);

export default API;
