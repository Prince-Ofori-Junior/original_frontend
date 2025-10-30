import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaArrowLeft } from "react-icons/fa";
import "../NotificationPage.css";

const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch notifications once on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        // 🚨 No token — user not logged in
        if (!token) {
          console.warn("⚠️ No auth token found — redirecting to login.");
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_ROOT}/notifications`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ must be Bearer
          },
        });

        console.debug("🔍 Notifications response:", res.status);

        // 🚨 Invalid token or expired session
        if (res.status === 401) {
          console.warn("⚠️ Unauthorized — removing token and redirecting.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Failed to fetch notifications:", data);
          setNotifications([]);
          return;
        }

        // ✅ Normalize API data
        const list = Array.isArray(data.notifications)
          ? data.notifications
          : [];

        const normalized = list
          .map((n) => ({
            id: n.id,
            title: n.title || "Notification",
            message: n.message || "",
            read: Boolean(n.is_read || n.read),
            date: n.created_at || n.createdAt,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setNotifications(normalized);
      } catch (err) {
        console.error("🔥 Error fetching notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  // ✅ Mark notification as read
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_ROOT}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!res.ok) {
        console.warn("⚠️ Mark-as-read request failed:", await res.text());
      }
    } catch (err) {
      console.error("❌ Failed to mark notification as read:", err);
    }
  };

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <Link to="/" className="back-btn">
          <FaArrowLeft /> Back
        </Link>
        <h2>
          <FaBell className="notif-icon" /> Notifications
        </h2>
      </header>

      {loading ? (
        <p className="loading">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
            alt="No Notifications"
          />
          <h3>No notifications yet</h3>
          <p>We’ll let you know when something important happens 🔔</p>
        </div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`notif-item ${notif.read ? "read" : "unread"}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
              title={notif.read ? "Read" : "Mark as read"}
            >
              <div className="notif-content">
                <FaBell className="notif-bell" />
                <div>
                  <strong>{notif.title}</strong>
                  <p style={{ margin: "4px 0" }}>{notif.message}</p>
                  <small style={{ color: "#666" }}>
                    {notif.date
                      ? new Date(notif.date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : ""}
                  </small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
 