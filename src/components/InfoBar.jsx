import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaShoppingCart, FaSearch } from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import "../InfoBar.css";
import { AuthContext } from "../context/AuthContext";

// ---------- CATEGORY ICONS ----------
const iconMap = {
  Electronics: <MdIcons.MdLaptopMac size={24} color="#0a8e03" />,
  Fashion: <MdIcons.MdCheckroom size={24} color="#0a8e03" />,
  "Food & Beverages": <MdIcons.MdFastfood size={24} color="#0a8e03" />,
  Furniture: <MdIcons.MdWeekend size={24} color="#0a8e03" />,
  "Phones & Tablets": <MdIcons.MdSmartphone size={24} color="#0a8e03" />,
  "Health & Beauty": <MdIcons.MdFavorite size={24} color="#0a8e03" />,
  "Home & Office": <MdIcons.MdHome size={24} color="#0a8e03" />,
  Appliances: <MdIcons.MdPower size={24} color="#0a8e03" />,
  Computing: <MdIcons.MdDesktopMac size={24} color="#0a8e03" />,
  "Sporting Goods": <MdIcons.MdSportsBasketball size={24} color="#0a8e03" />,
  "Baby Products": <MdIcons.MdChildCare size={24} color="#0a8e03" />,
  Gaming: <MdIcons.MdSportsEsports size={24} color="#0a8e03" />,
  "Other categories": <MdIcons.MdCategory size={24} color="#0a8e03" />,
};

// ---------- AVATAR ----------
const ModernAvatar = ({ user }) => {
  const colorMap = { admin: "#ff4d6d", seller: "#ffa500", customer: "#0a8e03" };
  const iconMap = {
    admin: MdIcons.MdAdminPanelSettings,
    seller: MdIcons.MdStore,
    customer: MdIcons.MdPerson,
  };

  if (!user)
    return (
      <div className="avatar-circle" style={{ backgroundColor: "#777" }}>
        <MdIcons.MdPerson size={20} color="#fff" />
      </div>
    );

  const role = user.role?.toLowerCase();
  const Icon = iconMap[role];
  const bg = colorMap[role] || "#999";

  return (
    <div className="avatar-circle" style={{ backgroundColor: bg }}>
      {Icon ? <Icon size={20} color="#fff" /> : <span>{user.name[0]}</span>}
    </div>
  );
};

// ---------- MAIN COMPONENT ----------
function InfoBar({ onCartClick, cartCount = 0, categories = [] }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const searchRef = useRef(null);

  // ========== 🔎 LIVE SEARCH ==========
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim().length > 1) {
        fetch(`http://localhost:8000/api/products?search=${encodeURIComponent(search.trim())}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data?.rows)) {
              setResults(data.data.rows.slice(0, 6));
              setShowResults(true);
            } else {
              setResults([]);
              setShowResults(false);
            }
          })
          .catch((err) => {
            console.error("Search error:", err);
            setResults([]);
            setShowResults(false);
          });
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // ========== CLICK OUTSIDE HANDLERS ==========
  useEffect(() => {
    const closeMenus = (e) => {
      if (!e.target.closest(".account-menu-wrapper") && !e.target.closest(".search-box")) {
        setShowDropdown(false);
        setShowResults(false);
      }
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  // ========== BODY SCROLL LOCK ==========
  useEffect(() => {
    document.body.style.overflow = showMobileCategories ? "hidden" : "";
  }, [showMobileCategories]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <>
      <div className="infobar">
        {/* ---------- LEFT ---------- */}
        <div className="infobar-left">
          <button
            className="hamburger"
            aria-label="Toggle categories"
            onClick={() => setShowMobileCategories(true)}
          >
            <FaBars />
          </button>

          <Link to="/" className="logo">
            <i>FoSTEN CoM.</i>
          </Link>
        </div>

        {/* ---------- CENTER ---------- */}
        <div className="infobar-center">
          <div className="search-box" ref={searchRef}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for products, brands and categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {showResults && results.length > 0 && (
              <div className="search-suggestions">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    className="search-suggestion-item"
                    onClick={() => {
                      setShowResults(false);
                      setSearch("");
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="search-thumb"
                    />
                    <div className="search-details">
                      <span className="search-name">{item.name}</span>
                      <span className="search-price">${item.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className="infobar-right">
          {/* Account */}
          <div className="account-menu-wrapper">
            <div
              className="icon-btn account-icon"
              onClick={() => setShowDropdown((p) => !p)}
            >
              <ModernAvatar user={user} />
            </div>

            {showDropdown && (
              <div className="account-dropdown">
                <div className="dropdown-header">
                  <ModernAvatar user={user} />
                  <span>{user?.name || "Guest"}</span>
                </div>

                {user ? (
                  <>
                    <Link to="/profile" className="dropdown-item"> Profile</Link>
                    <Link to="/orders" className="dropdown-item">
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="dropdown-item">
                      Wishlist
                    </Link>
                    <Link to="/notifications" className="dropdown-item">
                      Notifications
                    </Link>
                    <hr />
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="dropdown-item">
                    Login / Register
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="icon-btn cart-btn"
            title="Cart"
            onClick={onCartClick}
          >
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* ---------- MOBILE SIDEBAR ---------- */}
      {showMobileCategories && (
        <div className="mobile-overlay" onClick={() => setShowMobileCategories(false)} />
      )}

      <div className={`mobile-categories ${showMobileCategories ? "open" : ""}`}>
        <button
          className="close-btn"
          aria-label="Close categories"
          onClick={() => setShowMobileCategories(false)}
        >
          &times;
        </button>

        <div className="mobile-logo">
          <Link to="/" onClick={() => setShowMobileCategories(false)}>
            <i>FoSTEN CoM.</i>
          </Link>
        </div>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="mobile-category-item"
            onClick={() => setShowMobileCategories(false)}
          >
            <span className="cat-icon">
              {iconMap[cat.name] || <MdIcons.MdCategory size={24} color="#0a8e03" />}
            </span>
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export default InfoBar;
