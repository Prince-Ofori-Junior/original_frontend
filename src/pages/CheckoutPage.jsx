import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Checkout.css";

// ------------------- STATIC ICONS -------------------
import visaIcon from "../assets/visa.png";
import mastercardIcon from "../assets/mastercard.png";
import momoMtnIcon from "../assets/mtn.png";
import momoAirtelIcon from "../assets/airtel.png";
import momoTelecelIcon from "../assets/telecel.png";
import verveIcon from "../assets/verve.png";
import codIcon from "../assets/cod.png";

// ------------------- IMAGE RESOLVER -------------------
const resolveImage = (item, width = 80, height = 80) => {
  const img = item.image_url || item.img || item.image || "";
  if (img.startsWith("http")) return img;
  if (!img) return process.env.REACT_APP_PLACEHOLDER_IMAGE || "/placeholder.png";

  const publicId = img.replace(/\.(jpg|jpeg|png|webp|gif)$/i, "");
  const versionSegment = item.version ? `/v${item.version}` : "";
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${cloudName}/image/upload${versionSegment}/c_fill,w_${width},h_${height}/${publicId}`;
};

// ------------------- SUB-CHANNEL ICON MAPPING -------------------
const subChannelIcons = {
  visa: visaIcon,
  mastercard: mastercardIcon,
  mtn: momoMtnIcon,
  airtel: momoAirtelIcon,
  airteltigo: momoAirtelIcon,
  telecel: momoTelecelIcon,
  verve: verveIcon,
  cod_pickup: codIcon,
  cod: codIcon,
  pickup: codIcon,
};

const Checkout = ({ cartItems, setCartItems }) => {
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMainPayment, setSelectedMainPayment] = useState(null);
  const [selectedSubPayment, setSelectedSubPayment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // ✅ Load from .env
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const CALLBACK_URL =
    process.env.REACT_APP_PAYSTACK_CALLBACK_URL ||
    "https://original-frontend-theta.vercel.app/order-success";

  // ------------------- COMPUTE TOTAL -------------------
  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity || 1),
    0
  );

  // ------------------- FETCH DELIVERY & PAYMENT METHODS -------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchDelivery = async () => {
      try {
        setDeliveryLoading(true);
        const res = await fetch(`${API_BASE}/api/checkout/delivery-details`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) return navigate("/login");
        if (!res.ok) throw new Error("Failed to fetch delivery details");
        const data = await res.json();
        setDeliveryDetails({
          name: data.data.name || "",
          address: data.data.address || "",
          phone: data.data.phone || "",
          email: data.data.email || "",
        });
      } catch (err) {
        console.error("❌ Error fetching delivery details:", err);
      } finally {
        setDeliveryLoading(false);
      }
    };

    const fetchPaymentMethods = async () => {
      try {
        setPaymentLoading(true);
        const res = await fetch(`${API_BASE}/api/checkout/payment-methods`);
        if (!res.ok) throw new Error("Failed to fetch payment methods");
        const data = await res.json();
        if (data.success) setPaymentMethods(data.methods || []);
      } catch (err) {
        console.error("❌ Error fetching payment methods:", err);
      } finally {
        setPaymentLoading(false);
      }
    };

    fetchDelivery();
    fetchPaymentMethods();
  }, [API_BASE, navigate]);

  // ------------------- SAVE DELIVERY DETAILS -------------------
  const handleSaveDeliveryDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const { name, address, phone, email } = deliveryDetails;
    if (!name || !address || !phone || !email)
      return alert("All fields are required!");

    try {
      const res = await fetch(`${API_BASE}/api/checkout/delivery`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deliveryDetails),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Delivery details updated successfully!");
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update delivery details.");
      }
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Something went wrong while updating delivery details.");
    }
  };

  // ------------------- CONFIRM ORDER -------------------
  const handleConfirmOrder = async () => {
    if (!selectedMainPayment || !selectedSubPayment)
      return alert("Please select a payment method and sub-type.");
    if (!cartItems.length) return alert("Cart is empty.");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setOrderLoading(true);

    try {
      let paymentMethod = selectedMainPayment.method;
      let paymentChannel = selectedSubPayment.channel;

      if (paymentMethod === "mobile_money") paymentMethod = "momo";
      if (paymentMethod === "cod") paymentChannel = "cod_pickup";

      const payload = {
        items: cartItems.map((item) => ({
          productId: String(item.id || item.productId),
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        })),
        totalAmount: total,
        paymentMethod,
        paymentChannel,
        address: deliveryDetails.address,
        email: deliveryDetails.email,
        callback_url: CALLBACK_URL,
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.payment?.authorizationUrl) {
          // ✅ Redirect to Paystack for payment
          window.location.href = data.payment.authorizationUrl;
        } else {
          // ✅ COD (Cash on Delivery)
          localStorage.removeItem("cartItems");
          setCartItems([]);
          navigate("/order-success?cod=true", {
            state: { order: { ...data.order, totalAmount: total } },
          });
        }
      } else {
        alert(data.message || "Order failed. Please try again.");
      }
    } catch (err) {
      console.error("❌ Order submission failed:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  // ------------------- PAYMENT OPTIONS -------------------
  const renderPaymentGroup = (method) => {
    const titleMap = {
      cod: "Payment on Delivery",
      card: "Payment Card",
      mobile_money: "Mobile Money",
    };

    return (
      <section className="payment-group" key={method.method}>
        <h3>{titleMap[method.method] || method.method}</h3>
        {method.subMethods?.map((sub) => (
          <label key={sub.channel} className="payment-option">
            <div className="payment-left">
              <input
                type="radio"
                name="payment-sub"
                checked={selectedSubPayment?.channel === sub.channel}
                onChange={() => {
                  setSelectedMainPayment({ method: method.method });
                  setSelectedSubPayment(sub);
                }}
              />
              <span className="payment-label">{sub.label}</span>
            </div>

            <div className="payment-icon">
              <img
                src={subChannelIcons[sub.channel] || visaIcon}
                alt={sub.label}
              />
            </div>
          </label>
        ))}
      </section>
    );
  };

  return (
    <div className="checkout-page">
      <div className="checkout-rows">
        <div className="top-row">
          {/* Delivery Details */}
          <div className="checkout-section">
            <div className="section-header">
              <h2>Delivery Details</h2>
              {!isEditing && (
                <span className="edit-link" onClick={() => setIsEditing(true)}>
                  Edit Details
                </span>
              )}
            </div>
            {deliveryLoading ? (
              <p>Loading delivery details...</p>
            ) : !isEditing ? (
              <div>
                <p><strong>Name:</strong> {deliveryDetails.name}</p><br />
                <p><strong>Address:</strong> {deliveryDetails.address}</p><br />
                <p><strong>Phone:</strong> {deliveryDetails.phone}</p><br />
                <p><strong>Email:</strong> {deliveryDetails.email}</p>
              </div>
            ) : (
              <div className="delivery-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={deliveryDetails.name}
                  onChange={(e) =>
                    setDeliveryDetails({ ...deliveryDetails, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={deliveryDetails.address}
                  onChange={(e) =>
                    setDeliveryDetails({ ...deliveryDetails, address: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={deliveryDetails.phone}
                  onChange={(e) =>
                    setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={deliveryDetails.email}
                  onChange={(e) =>
                    setDeliveryDetails({ ...deliveryDetails, email: e.target.value })
                  }
                />
                <button className="btn btn-primary" onClick={handleSaveDeliveryDetails}>
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h2>Payment Method</h2>
            {paymentLoading ? (
              <p>Loading payment methods...</p>
            ) : (
              paymentMethods.map(renderPaymentGroup)
            )}
          </div>
        </div>

        {/* Items Preview */}
        <div className="checkout-section items-preview">
          <h2>Items in Your Order</h2>
          <div className="items-grid">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div className="preview-card" key={`${String(item.id)}-${index}`}>
                  <img
                    src={resolveImage(item, 100, 100)}
                    alt={item.name || "Product"}
                    className="preview-img"
                  />
                  <p>{item.name}</p>
                  <p className="item-price">GH₵ {Number(item.price).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p>No items to display</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-section summary">
          <h2>Order Summary</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span>Item's total ({cartItems.length})</span>
              <span>GH₵ {total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery fees</span>
              <span>GH₵ 64.00</span>
            </div>
            <hr />
            <div className="summary-row total-row">
              <strong>Total</strong>
              <strong>GH₵ {(total + 64).toFixed(2)}</strong>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              className="btn btn-primary"
              onClick={handleConfirmOrder}
              disabled={
                !selectedMainPayment ||
                !selectedSubPayment ||
                !cartItems.length ||
                orderLoading
              }
            >
              {orderLoading ? "Processing..." : "Confirm order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
