import React, { useEffect, useState } from "react";

function DeliverySection({ deliveryType, setDeliveryType, userAddress }) {
  const [intervals, setIntervals] = useState({
    door: "Calculating...",
    pickup: "Calculating...",
  });

  // Simulate fetching delivery interval from backend based on address
  useEffect(() => {
    if (!userAddress) return;

    // Example: Call backend API -> /api/delivery?address=Accra
    fetch(`http://localhost:8000/api/delivery?address=${encodeURIComponent(userAddress)}`)
      .then((res) => res.json())
      .then((data) => {
        setIntervals({
          door: data.door,
          pickup: data.pickup,
        });
      })
      .catch(() => {
        // fallback values
        setIntervals({
          door: "2–5 days",
          pickup: "3–6 days",
        });
      });
  }, [userAddress]);

  return (
    <section className="checkout-section delivery-section">
      <h3>Delivery Details</h3>

      <label>
        <input
          type="radio"
          name="delivery"
          value="Door Delivery"
          checked={deliveryType === "Door Delivery"}
          onChange={(e) => setDeliveryType(e.target.value)}
        />
        Door Delivery ({intervals.door})
      </label>

      <label>
        <input
          type="radio"
          name="delivery"
          value="Pick Up Point"
          checked={deliveryType === "Pick Up Point"}
          onChange={(e) => setDeliveryType(e.target.value)}
        />
        Pick Up Point ({intervals.pickup})
      </label>
    </section>
  );
}

export default DeliverySection;

