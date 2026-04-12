import React, { useState } from "react";
import queryImage from "./images/query.png";
import apiClient from "./utils/apiClient";

const QueriesPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg("");

    try {
      const data = await apiClient("quiz/post-query/", "POST", {
        name: formData.name,
        email: formData.email,
        contact: parseInt(formData.phone),
      });

      setResponseMsg("Request sent successfully!");
      setFormData({ name: "", email: "", phone: "" });
    } catch (error) {
      setResponseMsg("❌ Network error! Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="queries-container">
      <div className="image-container">
        <img src={queryImage} alt="Query Illustration" className="query-image" />
      </div>

      <div className="form-container">
        <h2 className="form-title">Request a call</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter name"
            className="input-field"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            className="input-field"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Sending..." : "Request Callback"}
          </button>
        </form>

        {responseMsg && <div style={{backgroundColor: "#008000", marginTop:"10px", color: "white", padding: "16px", borderRadius: "4px", display: "inline-block", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"}}>{responseMsg}</div>}
      </div>
    </div>
  );
};

export default QueriesPage;

