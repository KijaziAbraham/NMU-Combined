import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Dashboard = () => {
  const [prototypes, setPrototypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [storageFilter, setStorageFilter] = useState("");
  const [storageLocations, setStorageLocations] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchStorageLocations();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchPrototypes();
    }
  }, [userRole, searchTerm, storageFilter, currentPage]);

  const fetchUser = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setUserRole(response.data.role);
      setUserId(response.data.id);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchPrototypes = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `prototypes/?search=${searchTerm}&storage_location=${storageFilter}&page=${currentPage}&page_size=10`
      );

      setPrototypes(Array.isArray(response.data) ? response.data : response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 1) / 10));
    } catch (error) {
      console.error("Error fetching prototypes:", error);
      setPrototypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageLocations = async () => {
    try {
      const response = await api.get("prototypes/storage_locations/");
      setStorageLocations(response.data || []);
    } catch (error) {
      console.error("Error fetching storage locations:", error);
    }
  };

  const handleExport = async (format) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You need to log in first!");
      return;
    }

    try {
      const response = await api.get(`prototypes/export_${format}/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prototypes.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export. Please try again.");
    }
  };

  if (userRole === null) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Prototype Management System</h2>

      {/* Display Logged-in User Info */}
      {user && (
        <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
          <p><strong>Logged in as:</strong> {user.name} ({userRole})</p>
          <button onClick={() => navigate("/profile")} style={{ marginRight: "10px" }}>Profile</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
        </div>
      )}

      {/* Admin Actions */}
      {userRole === "admin" && (
        <>
          <button onClick={() => navigate("/submit-prototype")}>Add Prototype</button>
          <button onClick={() => handleExport("excel")}>Export Excel</button>
          <button onClick={() => handleExport("pdf")}>Export PDF</button>
          <h3>All Prototypes</h3>
        </>
      )}

      {/* Staff Actions */}
      {userRole === "staff" && <h3>Review and Approve Prototypes</h3>}

      {/* Student Actions */}
      {userRole === "student" && (
        <button onClick={() => navigate("/submit-prototype")}>Submit New Prototype</button>
      )}

      {/* Search & Storage Filter */}
      <input
        type="text"
        placeholder="Search by title or barcode..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <select value={storageFilter} onChange={(e) => setStorageFilter(e.target.value)}>
        <option value="">All Locations</option>
        {storageLocations.length > 0 ? (
          storageLocations.map((location, index) => (
            <option key={index} value={location}>
              {location}
            </option>
          ))
        ) : (
          <option disabled>No locations found</option>
        )}
      </select>

      {/* Prototype List */}
      {loading ? (
        <p>Loading prototypes...</p>
      ) : (
        <ul>
          {prototypes.length > 0 ? (
            prototypes.map((proto) => (
              <li key={proto.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd" }}>
                <strong>{proto.title}</strong>
                <p>Barcode: {proto.barcode || "Not Assigned"}</p>
                <p>Storage Location: {proto.storage_location || "Not Assigned"}</p>
                <p><strong>Status:</strong> {proto.status === "submitted_not_reviewed" ? "Submitted (Not Reviewed)" : "Submitted (Reviewed)"}</p>

                {/* Student Edit Own Prototypes */}
                {userRole === "student" && proto.student === userId && (
                  <button onClick={() => navigate(`/edit-prototype/${proto.id}`)}>Edit Prototype</button>
                )}

                {/* Admin can edit all prototypes */}
                {userRole === "admin" && (
                  <button onClick={() => navigate(`/edit-prototype/${proto.id}`)}>Edit Prototype</button>
                )}

                {/* Admin assigns storage */}
                {userRole === "admin" && (
                  <button onClick={() => navigate(`/assign-storage/${proto.id}`)}>Assign Storage</button>
                )}

                {/* Staff review button for each prototype */}
                {userRole === "staff" && (
                  <button onClick={() => navigate(`/review-prototype/${proto.id}`)}>Review Prototype</button>
                )}

                {/* View button to navigate to the prototype view page */}
                <button onClick={() => navigate(`/prototypes/${proto.id}`)}>View Prototype</button>
              </li>
            ))
          ) : (
            <p>No prototypes found.</p>
          )}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
          <span> Page {currentPage} of {totalPages} </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
