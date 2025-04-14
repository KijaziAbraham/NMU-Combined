import React from "react";
import { useNavigate } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";

// Separate Header Component
const Navbar = ({ user, searchTerm, setSearchTerm, handleShowSubmitModal, userRole }) => {
  const navigate = useNavigate();
  return (
    <div className="navibar-dashboard d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 className="mb-0 text-capitalize">
          {user ? `${user.role}` : "User"}
        </h2>
      </div>
      <div className="d-flex align-items-center">
        <div className="input-group me-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search prototypes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-outline-success" type="button">
            Search Prototype
          </button>
        </div>
        {(userRole === 'student' || userRole === 'admin' || userRole === 'staff') && (
          <button className="btn btn-success me-3" onClick={handleShowSubmitModal}>
            <BsPlusLg />
          </button>
        )}
        <div className="avatar">
          <img
            src={require("../pages/auth/assets/img/man.png")}
            alt="User Avatar"
            className="rounded-circle"
            width="50"
            height="50"
          />
        </div>
      </div>
    </div>
  );
};
export default Navbar;