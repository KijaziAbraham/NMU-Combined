import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import api from "../api/api";
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

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

  if (loading) return <p className="mt-5 text-center">Loading profile...</p>;
  if (!user) return <p className="mt-5 text-center">No user data found</p>;

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col className="">
          <DashboardSidebar 
          />
        </Col>
        {/* Main Content */}
        <Col md={10} className="">
          {/* Header */}
          <DashboardHeader user={user} />

          <h2 className="mb-4">User Profile</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!editMode ? (
            <Card>
              <Card.Body>
                <Card.Text><strong>Name:</strong> {user.username || "Not set"}</Card.Text>
                <Card.Text><strong>Email:</strong> {user.email || "Not set"}</Card.Text>
                <Card.Text><strong>Role:</strong> {user.role || "Not set"}</Card.Text>
                <Card.Text><strong>Phone:</strong> {user.phone || "Not set"}</Card.Text>
                <Card.Text><strong>Institution ID:</strong> {user.institution_id || "Not set"}</Card.Text>
                {user.department && <Card.Text><strong>Department:</strong> {user.department.name}</Card.Text>}
                <Button onClick={() => setEditMode(true)} className="me-2 btn btn-success">Edit Profile</Button>
                <Button onClick={handleChangePassword} className="btn btn-primary">Change Password</Button>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone:</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Institution Name:</Form.Label>
                    <Form.Control
                      type="text"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Button type="submit" className="me-2 btn btn-success">Save Changes</Button>
                  <Button type="button" onClick={() => setEditMode(false)} className="btn btn-danger">Cancel</Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;