import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/");
  };

  return (
    <nav>
      <h2>Prototype Archive System</h2>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
