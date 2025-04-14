import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdDashboard, MdScience, MdReviews, MdPerson } from "react-icons/md";
import '../components/assets/css/Sidebar.css'
const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
        <img className="circles-blur" src={require("../pages/auth/assets/img/Circles.png")} width={290} height={300} alt="" />
      <div className="sidebar-header p-3">
        <h4>Prototype Hub</h4>
      </div>
      <ul className="nav flex-column p-0">
        <li className="nav-item">
          <button className="nav-link active" onClick={() => navigate("/dashboard")}>
            <i className=""></i>Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate("/prototypes")}>
            <MdScience className="me-2" /> My Prototypes
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate("/reviews")}>
            <MdReviews className="me-2" /> Reviews
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" onClick={() => navigate("/profile")}>
            <MdPerson className="me-2" /> Profile
          </button>
        </li>
        {/* Add more sidebar items as needed */}
      </ul>
      <div className="sidebar-footer p-3 mt-auto">
        <button className="btn btn-outline-success w-100" onClick={() => navigate("/")}>LOGOUT</button>
      </div>
    </div>
  );
};
export default Sidebar;