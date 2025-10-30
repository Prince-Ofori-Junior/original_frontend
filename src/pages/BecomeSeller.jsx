import React, { useState } from "react";
import { AiOutlineShop, AiOutlineUpload, AiOutlineCheckCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import axios from "axios";
import "./BecomeSellerModern.css";

const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const BecomeSellerModern = () => {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idDocument, setIdDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!storeName || !phone || !address) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("storeName", storeName);
      formData.append("phone", phone);
      formData.append("address", address);
      if (idDocument) formData.append("idDocument", idDocument);

      const res = await axios.post(`${API_ROOT}/users/become-seller`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "You are now a seller!");
      setStep(3); // Move to final step
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="become-seller-modern-container">
      <h2>Become a Seller</h2>
      <p>Start selling your products on our marketplace</p>

      <div className="steps-container">
        {/* Step Cards */}
        <div className={`step-card ${step === 1 ? "active" : ""}`}>
          <AiOutlineShop size={40} />
          <h3>Step 1: Store Info</h3>
          {step === 1 && (
            <div className="form-step">
              <input
                type="text"
                placeholder="Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button onClick={nextStep}>Next</button>
            </div>
          )}
        </div>

        <div className={`step-card ${step === 2 ? "active" : ""}`}>
          <AiOutlineUpload size={40} />
          <h3>Step 2: Upload Documents</h3>
          {step === 2 && (
            <div className="form-step">
              <input
                type="file"
                onChange={(e) => setIdDocument(e.target.files[0])}
                accept=".jpg,.png,.pdf"
              />
              <div className="step-buttons">
                <button onClick={prevStep}>Back</button>
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`step-card ${step === 3 ? "active completed" : ""}`}>
          <AiOutlineCheckCircle size={40} />
          <h3>Step 3: Done!</h3>
          {step === 3 && <p>Your seller account request has been submitted successfully.</p>}
        </div>
      </div>
    </div>
  );
};

export default BecomeSellerModern;
