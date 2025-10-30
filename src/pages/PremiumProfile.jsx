import React, { useEffect, useState } from "react";
import "../PremiumProfile.css";

// Use API base URL from environment or fallback to localhost
const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

const PremiumProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const getToken = () => localStorage.getItem("token");
  const getRefreshToken = () => localStorage.getItem("refreshToken");

  // --- FETCH PROFILE ---
  const fetchProfile = async (retry = true) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.data) {
        setUser({
          ...data.data,
          isPremium: data.data.premium || false,
          profilePhoto: data.data.avatar || null,
          premiumExpiresAt: data.data.premium_expires_at || null,
        });
      } else {
        throw new Error(data.message || "Profile fetch failed");
      }
    } catch (err) {
      if (retry) {
        const success = await refreshToken();
        if (success) return fetchProfile(false);
      }
      console.error("Profile fetch failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // --- REFRESH TOKEN ---
  const refreshToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        localStorage.setItem("token", data.data.accessToken);
        return true;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
    return false;
  };

  // --- UPLOAD PROFILE PICTURE ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = getToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser((prev) => ({ ...prev, profilePhoto: data.data.avatar }));
        setMessage("Profile picture updated successfully");
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage(data.message || "Avatar upload failed");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setMessage("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  // --- UPDATE EMAIL ---
  const handleEmailUpdate = async () => {
    const newEmail = prompt("Enter new email:");
    if (!newEmail) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => ({ ...prev, email: newEmail }));
        setMessage("Email updated successfully");
      } else {
        setMessage(data.message || "Email update failed");
      }
    } catch (err) {
      console.error("Email update failed:", err);
      setMessage("Email update failed");
    }
  };

  // --- UPDATE PHONE WITH OTP ---
  const handlePhoneUpdate = async () => {
    const newPhone = prompt("Enter new phone number:");
    if (!newPhone) return;

    const token = getToken();
    if (!token) return;

    try {
      // Step 1: Request OTP
      const otpRequestRes = await fetch(
        `${API_BASE}/api/auth/profile/phone/request-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone: newPhone }),
        }
      );
      const otpRequestData = await otpRequestRes.json();
      if (!otpRequestData.success) {
        setMessage(otpRequestData.message || "Failed to request OTP");
        return;
      }

      // Step 2: Ask user for OTP
      const otp = prompt("Enter the OTP sent to your phone:");
      if (!otp) return;

      // Step 3: Verify OTP
      const otpVerifyRes = await fetch(
        `${API_BASE}/api/auth/profile/phone/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone: newPhone, otp }),
        }
      );
      const otpVerifyData = await otpVerifyRes.json();
      if (otpVerifyData.success) {
        setUser((prev) => ({ ...prev, phone: otpVerifyData.data.phone }));
        setMessage("Phone number updated successfully");
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage(otpVerifyData.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("Phone update failed:", err);
      setMessage("Phone update failed");
    }
  };

  // --- UPDATE PASSWORD ---
  const handlePasswordUpdate = async () => {
    const currentPassword = prompt("Enter current password:");
    const newPassword = prompt("Enter new password:");
    if (!currentPassword || !newPassword) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password updated successfully");
      } else {
        setMessage(data.message || "Password update failed");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      setMessage("Password update failed");
    }
  };

  // --- MANAGE CONNECTED ACCOUNTS ---
  const handleConnectedAccounts = async () => {
    const provider = prompt("Enter provider (e.g., google, facebook):");
    const action = prompt("Enter action: connect or disconnect");
    if (!provider || !action) return;

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/connected-accounts`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ provider, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully ${action}ed ${provider}`);
      } else {
        setMessage(data.message || "Failed to manage connected accounts");
      }
    } catch (err) {
      console.error("Connected accounts update failed:", err);
      setMessage("Failed to manage connected accounts");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!user) return <div className="profile-error">Please log in to view your profile.</div>;

  return (
    <div className="enterprise-profile-container">
      {message && <div className="profile-message">{message}</div>}

      {/* Header */}
      <div className="profile-header-section">
        <div className="profile-avatar-section">
          <img
            src={user.profilePhoto || "/default-avatar.png"}
            alt="Profile"
            className="profile-avatar"
          />
          <input
            type="file"
            className="upload-photo-input"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
          {uploading && <p>Uploading...</p>}
        </div>
        <div className="profile-basic-info">
          <h2>{user.name}</h2>
          <p><strong>Member ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
          {user.isPremium && <span className="premium-badge">🌟 Premium Member</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {["personal", "security", "finance", "premium"].map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">
        {activeTab === "personal" && (
          <div className="profile-section">
            <h3>Personal Information</h3>
            <ul>
              <li><strong>Name:</strong> {user.name}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Address:</strong> {user.address || "Not provided"}</li>
              <li><strong>Phone:</strong> {user.phone || "Not provided"}</li>
            </ul>
          </div>
        )}

        {activeTab === "security" && (
          <div className="profile-section">
            <h3>Account Security</h3>
            <ul>
              <li><button onClick={handleEmailUpdate}>Change Email</button></li>
              <li><button onClick={handlePasswordUpdate}>Change Password</button></li>
              <li><button onClick={handlePhoneUpdate}>Manage Verification Phones</button></li>
              <li><button onClick={handleConnectedAccounts}>Manage Connected Accounts</button></li>
            </ul>
          </div>
        )}

        {activeTab === "finance" && (
          <div className="profile-section">
            <h3>Finance</h3>
            <ul>
              <li><button>My Transactions</button></li>
              <li><button>Need Help?</button></li>
            </ul>
          </div>
        )}

        {activeTab === "premium" && (
          <div className="profile-section">
            <h3>Premium Plan</h3>
            {user.isPremium ? (
              <p>
                Your premium plan ({user.premium_plan || "N/A"}) expires on{" "}
                {user.premiumExpiresAt
                  ? new Date(user.premiumExpiresAt).toLocaleDateString()
                  : "Unknown"}.
              </p>
            ) : (
              <button className="premium-upgrade-btn">Upgrade to Premium</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumProfile;
