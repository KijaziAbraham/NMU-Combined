import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const response = await api.post("user/change-password/", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      setSuccess("Password changed successfully!");
      setFormData({ current_password: "", new_password: "", confirm_password: "" });

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      setError(error.response?.data?.detail || "Failed to change password.");
    }
  };

  return (
    <div>
      <h2>Change Password</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Current Password:
          <input
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          New Password:
          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleInputChange}
            required
          />
        </label>

        <label>
          Confirm New Password:
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleInputChange}
            required
          />
        </label>

        <button type="submit">Update Password</button>
        <button type="button" onClick={() => navigate("/profile")}>Cancel</button>
      </form>
    </div>
  );
};

export default ChangePassword;
