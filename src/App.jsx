import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import TopBar from "./components/TopBar";
import InfoBar from "./components/InfoBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileNavSidebar from "./components/MobileNavSidebar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ProductPage from "./pages/ProductPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import FurniturePage from "./pages/FurniturePage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrderSuccess from "./pages/OrderSuccess";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import NotificationsPage from "./pages/NotificationPage";
import PremiumProfile from "./pages/PremiumProfile";

import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

if (process.env.NODE_ENV === "production") {
  const noop = () => {};
  console.log = console.info = console.warn = console.error = console.debug = noop;
}

// ---------------- Layout Wrapper ----------------
const LayoutWrapper = ({
  children,
  cartItems,
  setMobileNavOpen,
  mobileNavOpen,
  setSearchTerm,
  categories
}) => (
  <>
    <TopBar />
    <InfoBar
      onHamburgerClick={() => setMobileNavOpen(true)}
      onSearch={(term) => setSearchTerm(term)}
      cartCount={cartItems.length}
      categories={categories}
    />
    <Navbar />
    <MobileNavSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    <main>{children}</main>
    <Footer />
  </>
);

// ---------------- Layout Routes ----------------
const LayoutRoutes = ({
  cartItems,
  setMobileNavOpen,
  mobileNavOpen,
  setSearchTerm,
  searchTerm,
  selectedCategory,
  setSelectedCategory,
  addToCart,
  removeFromCart,
  clearCart,
  setCartItems,
  categories
}) => {
  const location = useLocation();
  const hideLayout = ["/login", "/register"].includes(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("auth-active", hideLayout);
  }, [hideLayout]);

  return hideLayout ? (
    <div className="auth-page">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  ) : (
    <LayoutWrapper
      cartItems={cartItems}
      setMobileNavOpen={setMobileNavOpen}
      mobileNavOpen={mobileNavOpen}
      setSearchTerm={setSearchTerm}
      categories={categories}
    >
      <Routes>
        {/* 🏠 Main Pages */}
        <Route
          path="/"
          element={
            <ProductPage
              addToCart={addToCart}
              searchTerm={searchTerm}
              selectedType={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          }
        />
        <Route
          path="/furniture"
          element={
            <FurniturePage
              addToCart={addToCart}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          }
        />
        <Route path="/product/:id" element={<ProductDetailsPage addToCart={addToCart} />} />

        {/* 🛒 Cart & Checkout */}
        <Route
          path="/cart"
          element={<CartPage cartItems={cartItems} removeFromCart={removeFromCart} clearCart={clearCart} />}
        />
        <Route
          path="/checkout"
          element={<CheckoutPage cartItems={cartItems} setCartItems={setCartItems} clearCart={clearCart} />}
        />

        {/* ✅ Other pages */}
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* 🌟 Profile Page (with layout) */}
        <Route path="/profile" element={<PremiumProfile />} />
      </Routes>
    </LayoutWrapper>
  );
};

// ---------------- Main App ----------------
function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  // ✅ Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/products/categories/list");
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          console.error("Invalid category data:", data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const addToCart = (product) => setCartItems([...cartItems, product]);
  const removeFromCart = (index) => setCartItems(cartItems.filter((_, i) => i !== index));
  const clearCart = () => setCartItems([]);

  return (
    <AuthProvider>
      <Router>
        <LayoutRoutes
          cartItems={cartItems}
          setMobileNavOpen={setMobileNavOpen}
          mobileNavOpen={mobileNavOpen}
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          setCartItems={setCartItems}
          categories={categories}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
