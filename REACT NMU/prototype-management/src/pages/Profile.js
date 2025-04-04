import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    institution_id: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setFormData({
        username: response.data.username || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        institution_id: response.data.institution_id || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch("user/profile/", formData);
      setUser(response.data);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.detail || "Failed to update profile");
    }
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No user data found</p>;

  return (
    <div>
      <h2>User Profile</h2>

      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      {!editMode ? (
        <div>
          <p><strong>Name:</strong> {user.username || "Not set"}</p>
          <p><strong>Email:</strong> {user.email || "Not set"}</p>
          <p><strong>Role:</strong> {user.role || "Not set"}</p>
          <p><strong>Phone:</strong> {user.phone || "Not set"}</p>
          <p><strong>Institution ID:</strong> {user.institution_id || "Not set"}</p>
          {user.department && <p><strong>Department:</strong> {user.department.name}</p>}

          <button onClick={() => setEditMode(true)}>Edit Profile</button>
          <button onClick={handleChangePassword}>Change Password</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Phone:
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </label>

          <label>
            Institution ID:
            <input
              type="text"
              name="institution_id"
              value={formData.institution_id}
              onChange={handleInputChange}
            />
          </label>

          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default Profile;
