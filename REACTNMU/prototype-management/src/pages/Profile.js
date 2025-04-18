import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
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
    institution_name: "", // Added institution_name
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
        institution_name: response.data.institution_name || "", // Initialize institution_name
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

  if (loading) return <p className="mt-5 text-center">Loading profile...</p>;
  if (!user) return <p className="mt-5 text-center">No user data found</p>;

  return (
    <div className="dashboard-container">
      <DashboardSidebar />
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <DashboardHeader user={user} />

            <h2 className="mb-4">User Profile</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {!editMode ? (
              <div className="card">
                <div className="card-body">
                  <p className="card-text"><strong>Name:</strong> {user.username || "Not set"}</p>
                  <p className="card-text"><strong>Email:</strong> {user.email || "Not set"}</p>
                  <p className="card-text"><strong>Role:</strong> {user.role || "Not set"}</p>
                  <p className="card-text"><strong>Phone:</strong> {user.phone || "Not set"}</p>
                  <p className="card-text"><strong>Institution ID:</strong> {user.institution_id || "Not set"}</p>
                  {user.department && <p className="card-text"><strong>Department:</strong> {user.department.name}</p>}
                  <button onClick={() => setEditMode(true)} className="btn btn-success me-2">Edit Profile</button>
                  <button onClick={handleChangePassword} className="btn btn-primary">Change Password</button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
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

                    <div className="mb-3">
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

                    <div className="mb-3">
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

                    <div className="mb-3">
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

                    <button type="submit" className="btn btn-success me-2">Save Changes</button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn btn-danger">Cancel</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;