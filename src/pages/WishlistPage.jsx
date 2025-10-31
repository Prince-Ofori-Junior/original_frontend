import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../WishlistPage.css";

function WishlistPage({ addToCart }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortByPrice, setSortByPrice] = useState(false);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await API.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data?.wishlist || [];
      const normalized = items.map((item) => ({
        ...item,
        price: item.price ?? 0,
        discountPrice: item.discountPrice ?? item.discount_price ?? null,
      }));
      setWishlist(normalized);
    } catch (err) {
      console.error("❌ Failed to fetch wishlist:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await API.delete("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
        params: { productId },
      });

      if (res.data?.success) {
        setWishlist((prev) => prev.filter((item) => item.product_id !== productId));
      }
    } catch (err) {
      console.error("❌ Failed to remove:", err.response?.data || err.message);
    }
  };

  const handleClearAll = () => setWishlist([]);
  const handleSortByPrice = () => {
    const sorted = [...wishlist].sort((a, b) =>
      sortByPrice ? a.price - b.price : b.price - a.price
    );
    setWishlist(sorted);
    setSortByPrice(!sortByPrice);
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        <div className="spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">❤️ Your Wishlist</h2>

      {wishlist.length > 0 && (
        <div className="wishlist-toolbar glassy-toolbar">
          <button onClick={handleClearAll} className="toolbar-btn clear-btn">
            🧹 Clear All
          </button>
          <button onClick={handleSortByPrice} className="toolbar-btn sort-btn">
            💲 Sort by Price {sortByPrice ? "↓" : "↑"}
          </button>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <img src="/empty-heart.svg" alt="Empty Wishlist" />
          <h3>No saved items yet</h3>
          <p>Browse products and tap ❤️ to save your favorites.</p>
          <Link to="/shop" className="browse-btn">Browse Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => {
            const productId = item.product_id;
            const price = item.discountPrice ?? item.price;
            return (
              <div className="wishlist-card" key={productId}>
                <div className="wishlist-image-wrapper">
                  <img
                    src={item.image_url || "/placeholder.png"}
                    alt={item.name}
                    className="wishlist-img"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                  <div className="wishlist-overlay"></div>
                </div>
                <div className="wishlist-info">
                  <h3>{item.name}</h3>
                  <p className="wishlist-price">GHS {Number(price).toFixed(2)}</p>
                </div>
                <div className="wishlist-actions">
                  <button
                    className="remove-btn"
                    onClick={() => removeFromWishlist(productId)}
                  >
                    Remove
                  </button>
                  <button
                    className="add-cart-btn"
                    onClick={() =>
                      addToCart ? addToCart(item) : navigate(`/product/${productId}`)
                    }
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
