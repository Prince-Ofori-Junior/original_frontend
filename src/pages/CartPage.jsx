import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../CartPage.css";

function CartPage({ cartItems = [], removeFromCart, clearCart }) {
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  // ✅ Use local state for cart to allow stepper without reload
  const [localCart, setLocalCart] = useState(
    cartItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
      price: parseFloat(item.price) || 0,
    }))
  );

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // ✅ Load saved cart from localStorage when the page reloads
  useEffect(() => {
    const saved = localStorage.getItem("savedCart");
    if (saved) {
      const parsed = JSON.parse(saved).map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
      }));
      setLocalCart(parsed);
    }
  }, []);

  // ✅ Sync localCart to localStorage whenever it changes
  useEffect(() => {
    if (localCart.length > 0) {
      localStorage.setItem("savedCart", JSON.stringify(localCart));
    } else {
      localStorage.removeItem("savedCart");
    }
  }, [localCart]);

  // ✅ Quantity Controls (Fixed increment/decrement logic)
  const handleQuantityChange = (index, change) => {
    setLocalCart((prev) => {
      const updated = [...prev];
      const currentQty = Number(updated[index].quantity) || 1;
      const newQty = Math.max(1, currentQty + Number(change));
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const increment = (index) => handleQuantityChange(index, 1);
  const decrement = (index) => handleQuantityChange(index, -1);

  // ✅ Handle coupon
  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === "SAVE10") {
      setDiscount(0.1);
      alert("✅ Coupon applied! 10% discount added.");
    } else {
      setDiscount(0);
      alert("❌ Invalid coupon code.");
    }
  };

  // ✅ Handle checkout
  const handleCheckout = () => {
    localStorage.setItem("savedCart", JSON.stringify(localCart));
    if (isLoggedIn) {
      navigate("/checkout");
    } else {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      alert("⚠️ Please log in to continue to checkout.");
      navigate("/login");
    }
  };

  // ✅ Image resolver for Cloudinary or fallback
  const resolveImage = (item, width = 120, height = 120) => {
    const img = item.image_url || item.img || item.image || "";
    if (!img) return "/placeholder.png";
    if (img.startsWith("http")) return img;
    const publicId = img.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const versionSegment = item.version ? `/v${item.version}` : "";
    return `https://res.cloudinary.com/dzisnfs3h/image/upload${versionSegment}/c_fill,w_${width},h_${height}/${publicId}`;
  };

  // ✅ Calculate totals
  const subtotal = localCart.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0
  );
  const total = subtotal - subtotal * discount;

  return (
    <div className="cart-page">
      <h2 className="cart-header">🛒 Shopping Cart</h2>

      {localCart.length === 0 ? (
        <div className="empty-cart">
          <img
            src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
            alt="Empty Cart"
            className="empty-cart-icon"
          />
          <p>Your cart is empty.</p>
          <Link to="/" className="shop-now-btn">
            <i>Continue Shopping</i>
          </Link>
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {localCart.map((item, index) => (
              <li key={index} className="cart-item">
                <img src={resolveImage(item, 140, 140)} alt={item.name} />
                <div className="cart-info">
                  <div className="product-details">
                    <h4>{item.name}</h4>
                    <p>GHS {(parseFloat(item.price) || 0).toFixed(2)}</p>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => decrement(index)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increment(index)}>+</button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => {
                      removeFromCart(index);
                      setLocalCart((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button onClick={handleApplyCoupon}>
              <i>Apply</i>
            </button>
          </div>

          <div className="cart-total">
            <h3>Subtotal: GHS {subtotal.toFixed(2)}</h3>
            {discount > 0 && (
              <h4 className="discount-text">
                Discount: −{(discount * 100).toFixed(0)}%
              </h4>
            )}
            <h2>Total: GHS {total.toFixed(2)}</h2>

            <div className="cart-actions">
              <button
                className="clear-btn"
                onClick={() => {
                  clearCart();
                  setLocalCart([]);
                  localStorage.removeItem("savedCart");
                }}
              >
                <i>Clear Cart</i>
              </button>

              <button className="checkout-btn" onClick={handleCheckout}>
                <i>Proceed to Checkout</i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
