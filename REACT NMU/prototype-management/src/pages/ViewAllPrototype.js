import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardHeader from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';

const ViewAllPrototype = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPrototypes, setAllPrototypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedPrototype, setSelectedPrototype] = useState(null);

  // Fetch user profile and role
  const fetchUser = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await api.get("users/students/");
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch prototypes
  const fetchPrototypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/prototypes/?search=${searchTerm}`);
      setAllPrototypes(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching prototypes:", error);
      setError("Failed to load prototypes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchPrototypes();
  }, [searchTerm]);

  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.username : "N/A";
  };

  const handlePrototypeClick = (prototype) => {
    setSelectedPrototype(prototype);
  };

  const handleCloseModal = () => {
    setSelectedPrototype(null);
  };

  return (
    <div className="dashboard-container">
      <DashboardSidebar />
      <div className="main-content p-2 shadow-sm">
        <DashboardHeader
          user={user}
          userRole={userRole}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
    <div className="review-prototypes-container">
            <h2 className="page-title">All Prototypes</h2>

        {loading ? (
          <p className="mt-5 text-center">Loading prototypes...</p>
        ) : error ? (
          <p className="mt-5 text-center text-danger">{error}</p>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {allPrototypes.length > 0 ? (
              allPrototypes.map((prototype) => (
                <div className="col" key={prototype.id}>
                  <div
                    className="card"
                    style={{
                      borderLeft: "4px solid #64A293",
                      cursor: "pointer",
                    }}
                    onClick={() => handlePrototypeClick(prototype)}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{prototype.title || "Untitled"}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Student: {prototype.username || getStudentName(prototype.student)}
                      </h6>
                      <p className="card-text">
                        {prototype.abstract?.substring(0, 100)}
                        {prototype.abstract?.length > 100 && "..."}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center col-12 text-muted mt-4">
                No prototypes found.
              </div>
            )}
          </div>
        )}

        {/* Modal for Prototype Details */}
        {selectedPrototype && (
          <>
            <div
              className="modal show"
              tabIndex="-1"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-fullscreen">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedPrototype.title || "Prototype Details"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>
                      <strong>Student:</strong>{" "}
                      {selectedPrototype.username ||
                        getStudentName(selectedPrototype.student)}
                    </p>
                    <p>
                      <strong>Abstract:</strong>{" "}
                      {selectedPrototype.abstract || "No abstract provided."}
                    </p>
                    <p>
                     <strong>Status:</strong>{" "}{selectedPrototype.status  === "submitted_not_reviewed" ? "Submitted (Not Reviewed)": "Submitted (Reviewed)"}

                    </p>
                    <p>
                      <strong>Storage Location:</strong>{" "}
                      {selectedPrototype.storage_location?.name || "Not assigned"}
                    </p>
                    <p>
                      <strong>Submitted On:</strong>{" "}
                      {selectedPrototype.submission_date
                        ? new Date(selectedPrototype.submission_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                    {/* Add additional fields if necessary */}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
        </div>
  );
};

export default ViewAllPrototype;
