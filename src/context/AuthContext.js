import React, { createContext, useState, useEffect, useCallback } from "react";
import API from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // -------------------- STATE --------------------
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    (process.env.REACT_APP_API_BASE_URL || API.defaults.baseURL || "https://original-backend-bcme.onrender.com").replace(/\/+$/, "");

  // -------------------- Normalize avatar URL --------------------
  const normalizeAvatar = useCallback(
    (avatarPath) => {
      if (!avatarPath) return null;
      if (avatarPath.startsWith("http")) return avatarPath;
      return `${API_BASE_URL}/uploads/avatars/${avatarPath.replace(/^\/+/, "")}`;
    },
    [API_BASE_URL]
  );

  // -------------------- Refresh token --------------------
  const refreshToken = useCallback(async () => {
    try {
      const res = await API.post("/auth/refresh", {}, { withCredentials: true });
      if (res.data?.success) {
        const { accessToken, user: refreshedUser } = res.data.data;
        refreshedUser.avatar = normalizeAvatar(refreshedUser.avatar || null);
        setUser(refreshedUser);
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        localStorage.setItem("token", accessToken);
        return accessToken;
      }
      throw new Error("Refresh failed");
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.error("AuthContext: refresh token failed", err);
      return null;
    }
  }, [normalizeAvatar]);

  // -------------------- Fetch user --------------------
  const fetchUser = useCallback(
    async (retry = true) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let res;

        if (token) {
          res = await API.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
        } else if (retry) {
          const refreshRes = await refreshToken();
          if (!refreshRes) throw new Error("Refresh failed");
          return fetchUser(false);
        }

        if (res?.data?.success) {
          const userData = res.data.data.user || res.data.data;
          userData.avatar = normalizeAvatar(userData.avatar || null);
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          throw new Error("Failed to fetch user");
        }
      } catch (err) {
        if (err.response?.data?.message?.includes("expired") && retry) {
          await refreshToken();
          return fetchUser(false);
        }
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    },
    [normalizeAvatar, refreshToken]
  );

  // -------------------- Login --------------------
  const login = useCallback(
    async (email, password) => {
      const res = await API.post("/auth/login", { email, password }, { withCredentials: true });

      if (!res.data?.success) throw new Error(res.data.message || "Login failed");

      const { user: userData, accessToken } = res.data.data;
      userData.avatar = normalizeAvatar(userData.avatar || null);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", accessToken);

      return userData;
    },
    [normalizeAvatar]
  );

  // -------------------- Logout --------------------
  const logout = useCallback(async () => {
    try {
      await API.post(
        "/auth/logout",
        { refreshToken: localStorage.getItem("token") },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  // -------------------- Initialize --------------------
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, loading, refreshToken, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
