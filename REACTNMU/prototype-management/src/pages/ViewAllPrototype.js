import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardHeader from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';

const ViewAllPrototype = () => {
  const [allPrototypes, setAllPrototypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedPrototype, setSelectedPrototype] = useState(null);

  const fetchStudents = async () => {
    try {
      const response = await api.get("users/students/");
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    const fetchAllPrototypes = async () => {
      setLoading(true);
      setError(null);
      fetchStudents();

      try {
        const response = await api.get('/prototypes/');
        setAllPrototypes(response.data.results || response.data || []);
      } catch (error) {
        console.error("Error fetching all prototypes:", error);
        setError("Failed to load prototypes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPrototypes();
  }, []);

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.username : 'N/A';
  };

  const handlePrototypeClick = (prototype) => {
    setSelectedPrototype(prototype);
  };

  const handleCloseModal = () => {
    setSelectedPrototype(null);
  };

  if (loading) {
    return <p className="mt-5 text-center">Loading prototypes...</p>;
  }

  if (error) {
    return <p className="mt-5 text-center text-danger">{error}</p>;
  }

  return (
   <div className="dashboard-container">
 
     <DashboardSidebar />
     <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <DashboardHeader />
          <h2 className="mb-4">All Prototypes</h2>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {allPrototypes.length > 0 ? (
              allPrototypes.map((prototype) => (
                <div className="col" key={prototype.id}>
                  <div
                    className="card"
                    style={{ borderLeft: '4px solid #64A293', cursor: 'pointer' }}
                    onClick={() => handlePrototypeClick(prototype)}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{prototype.title || 'Untitled'}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Student: {prototype.username || getStudentName(prototype.student)}
                      </h6>
                      <p className="card-text">
                        {prototype.abstract?.substring(0, 100)}
                        {prototype.abstract?.length > 100 && '...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 10 }).map((_, index) => (
                <div className="col" key={`empty-${index}`}>
                  <div
                    className="prototype-item placeholder-item"
                    style={{
                      height: '85px',
                      borderLeft: '4px solid #64A293',
                      paddingLeft: '10px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <p className="mb-0 text-muted">No prototype</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal for Prototype Details */}
          <div className={`modal ${selectedPrototype ? 'show' : ''}`} tabIndex="-1" style={{ display: selectedPrototype ? 'block' : 'none' }}>
            <div className="modal-dialog modal-fullscreen">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedPrototype?.title || 'Prototype Details'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Student:</strong>{' '}
                    {selectedPrototype?.username || getStudentName(selectedPrototype?.student)}
                  </p>
                  <p>
                    <strong>Abstract:</strong>{' '}
                    {selectedPrototype?.abstract || 'No abstract provided.'}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {selectedPrototype?.status || 'N/A'}
                  </p>
                  <p>
                    <strong>Storage Location:</strong>{' '}
                    {selectedPrototype?.storage_location?.name || 'Not assigned'}
                  </p>
                  <p>
                    <strong>Submitted On:</strong>{' '}
                    {selectedPrototype?.created_at
                      ? new Date(selectedPrototype.created_at).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  {/* Add more fields or layout formatting here */}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          {selectedPrototype && <div className="modal-backdrop fade show" style={{ display: 'block' }}></div>}

        </div>
      </div>
    </div>
   </div>
  );
};

export default ViewAllPrototype;