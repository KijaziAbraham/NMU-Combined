import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/login/";  // weka the current API URL to your backend login endpoint

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        API_URL,
        { email, password }, 
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("access_token", response.data.tokens.access);
      alert("Login successful!");
      navigate("/dashboard");  // Redirect to the dashboard as page ya kwanza after login
    } catch (error) {
      console.error("Login failed:", error.response ? error.response.data : error);
      alert("Invalid credentials!");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
