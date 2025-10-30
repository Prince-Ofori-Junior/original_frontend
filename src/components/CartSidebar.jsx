import React from "react";
import { useNavigate } from "react-router-dom";
// import "./CartSidebar.css"; // optional CSS

function CartSidebar({ open, onClose, items = [], onRemove }) {
  const navigate = useNavigate();

  // Calculate total safely
  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  // Navigate to checkout
  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  /**
   * Resolve image URL:
   * 1. Use full URL if provided
   * 2. Otherwise, construct Cloudinary URL from public ID and optional version
   * 3. Apply thumbnail transformation
   * 4. Fallback to placeholder if missing
   */
  const resolveImage = (item, width = 100, height = 100) => {
    const img = item.image_url || item.img || item.image || "";

    if (img.startsWith("http")) return img; // full URL

    if (!img) return "/placeholder.png"; // fallback

    const publicId = img.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
    const versionSegment = item.version ? `/v${item.version}` : "";

    return `https://res.cloudinary.com/dzisnfs3h/image/upload${versionSegment}/c_fill,w_${width},h_${height}/${publicId}`;
  };

  return (
    <div className={`cart-sidebar ${open ? "open" : ""}`}>
      <button className="close-cart" onClick={onClose}>
        &times;
      </button>

      <h3>Shopping Cart</h3>

      <div className="cart-content">
        {items.length ? (
          <ul id="cartItems">
            {items.map((item, index) => (
              <li key={index} className="cart-item">
                <img
                  src={resolveImage(item)}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price">
                    GHS {Number(item.price || 0).toFixed(2)}
                  </span>
                  <button
  className="cart-item-remove"
  onClick={() => onRemove(index)}
  style={{
    backgroundColor: "#ff4d4f", // red background
    color: "#fff",             // white text
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "5px"
  }}
>
  Remove
</button>

                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center" }}>Your cart is empty.</p>
        )}

        {items.length > 0 && (
          <p className="cart-total">
            Total: GHS <span id="cartTotal">{total.toFixed(2)}</span>
          </p>
        )}
      </div>

      {items.length > 0 && (
        <button
          className="btn btn-primary checkout-btn"
          onClick={handleCheckout}
        >
          Checkout
        </button>
      )}
    </div>
  );
}

export default CartSidebar;
