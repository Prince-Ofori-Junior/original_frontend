import React, { useEffect, useState } from "react";
import axios from "axios";

function DeliverySection({ deliveryType, setDeliveryType, userAddress }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/delivery/options", {
          address: userAddress,
        });
        setOptions(res.data);
      } catch (err) {
        console.error("Failed to fetch delivery options", err);
      }
    };

    if (userAddress) fetchOptions();
  }, [userAddress]);

  return (
    <section className="checkout-section delivery-section">
      <h3>Delivery Details</h3>
      {options.map((opt) => (
        <label key={opt.id}>
          <input
            type="radio"
            name="delivery"
            value={opt.id}
            checked={deliveryType === opt.id}
            onChange={(e) => setDeliveryType(e.target.value)}
          />
          {opt.label} ({opt.start} - {opt.end})
        </label>
      ))}
    </section>
  );
}

export default DeliverySection;
