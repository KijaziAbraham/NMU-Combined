import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import api from "../api/api";
import "../pages/Materials/css/Profile.css";

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
    institution_name: "",
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
        institution_name: response.data.institution_name || "",
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

  if (loading) return <div className="loading-spinner">Loading profile...</div>;
  if (!user) return <div className="no-user">No user data found</div>;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="main-content">
        <DashboardHeader user={user} />
        
        <div className="profile-container">
          <h2 className="profile-title">User Profile</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!editMode ? (
            <div className="profile-card view-mode">
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{user.username || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role:</span>
                  <span className="info-value">{user.role || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{user.phone || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Institution ID:</span>
                  <span className="info-value">{user.institution_id || "Not set"}</span>
                </div>
                {user.department && (
                  <div className="info-item">
                    <span className="info-label">Department:</span>
                    <span className="info-value">{user.department.name}</span>
                  </div>
                )}
              </div>
              <div className="profile-actions">
                <button onClick={() => setEditMode(true)} className="btn btn-edit">
                  Edit Profile
                </button>
                <button onClick={handleChangePassword} className="btn btn-change-password">
                  Change Password
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-card edit-mode">
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">Username:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email:</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="institution_name" className="form-label">Institution Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="institution_name"
                    name="institution_name"
                    value={formData.institution_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-save">
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="btn btn-cancel">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;