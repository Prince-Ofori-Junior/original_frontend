import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../OrderSuccess.css";

const OrderSuccess = () => {
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "failed"
  const [orderDetails, setOrderDetails] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Dynamically choose correct API base depending on environment
  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    (window.location.hostname.includes("vercel.app")
      ? "https://original-backend-8b5r.onrender.com"
      : "https://original-backend-8b5r.onrender.com");

  const REDIRECT_HOME =
    process.env.REACT_APP_REDIRECT_HOME ||
    (window.location.hostname.includes("vercel.app")
      ? "https://original-frontend-theta.vercel.app"
      : "/");

  const ORDERS_PAGE = process.env.REACT_APP_ORDERS_PAGE || "/orders";

  // --- Extract URL query params ---
  const query = new URLSearchParams(location.search);
  const reference = query.get("reference"); // Paystack transaction reference
  const orderId = query.get("orderId");
  const isCOD = query.get("cod") === "true"; // Cash on Delivery flag

  useEffect(() => {
    const verifyOrder = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // ---------------- COD FLOW ----------------
      if (isCOD) {
        setStatus("success");
        setOrderDetails(location.state?.order || { id: orderId });
        localStorage.removeItem("cartItems");

        const timer = setTimeout(() => navigate(REDIRECT_HOME), 10000);
        return () => clearTimeout(timer);
      }

      // ---------------- PAYSTACK FLOW ----------------
      if (!reference) {
        console.warn("❌ No Paystack reference found in URL");
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/orders/paystack/verify/${reference}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setOrderDetails(data.order || { id: data.orderId });
          localStorage.removeItem("cartItems");

          const timer = setTimeout(() => navigate(REDIRECT_HOME), 10000);
          return () => clearTimeout(timer);
        } else {
          console.error("❌ Verification failed:", data.message);
          setStatus("failed");
        }
      } catch (err) {
        console.error("❌ Error verifying order:", err);
        setStatus("failed");
      }
    };

    verifyOrder();
  }, [reference, isCOD, orderId, navigate, location.state, API_BASE, REDIRECT_HOME]);

  // ---------------- UI STATES ----------------

  if (status === "loading") {
    return (
      <div className="order-status loading">
        <div className="spinner" />
        <p>Verifying your order, please wait...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="order-status error">
        <div className="error-icon">❌</div>
        <h2>Oops! Something went wrong</h2>
        <p>
          {isCOD
            ? "We couldn’t confirm your Cash on Delivery order. Please try again."
            : "We couldn’t verify your payment. If money was deducted, please contact our support team."}
        </p>
        <button className="btn btn-primary" onClick={() => navigate(REDIRECT_HOME)}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="order-status success">
      <div className="success-icon">✅</div>
      <h2>Thank you for shopping with us!</h2>
      <p className="success-message">
        {isCOD
          ? "Your order has been placed successfully and will be processed for Cash on Delivery."
          : "Your payment was successful, and your order is now being processed."}
      </p>

      {orderDetails ? (
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p>
            <strong>Order ID:</strong> {orderDetails.id || orderId}
          </p>
          {orderDetails.totalAmount && (
            <p>
              <strong>Total:</strong> GHS {orderDetails.totalAmount}
            </p>
          )}
          {orderDetails.status && (
            <p>
              <strong>Status:</strong> {orderDetails.status}
            </p>
          )}
        </div>
      ) : (
        <p className="no-details">
          Your order details could not be loaded, but payment was confirmed.
        </p>
      )}

      <p className="redirect-note">
        You’ll be redirected to the shop shortly. To track your order, go to{" "}
        <strong>My Orders</strong>.
      </p>

      <div className="order-actions">
        <button className="btn btn-primary" onClick={() => navigate(REDIRECT_HOME)}>
          Continue Shopping
        </button>
        <button className="btn btn-secondary" onClick={() => navigate(ORDERS_PAGE)}>
          Track My Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
