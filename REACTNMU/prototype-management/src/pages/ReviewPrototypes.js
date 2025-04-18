import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import api from '../api/api';
import { PencilSquare, Eye, ChatDots } from 'react-bootstrap-icons';
import ViewPrototypeModal from './ViewPrototype';
import EditPrototypeModal from './EditPrototype';
import ReviewPrototypeModal from "../components/ReviewPrototypeModal";
import AssignStorageModal from '../components/AssignStorageModal';

const ITEMS_PER_PAGE = 20;

const ReviewPrototypes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prototypes, setPrototypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPrototypeIdForView, setSelectedPrototypeIdForView] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrototypeIdForEdit, setSelectedPrototypeIdForEdit] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPrototypeIdForReview, setSelectedPrototypeIdForReview] = useState(null);
  const [showAssignStorageModal, setShowAssignStorageModal] = useState(false);
  const [selectedPrototypeForAssignStorage, setSelectedPrototypeForAssignStorage] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
    fetchStudents();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("user/profile/");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load user profile.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("departments/");
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("users/students/");
      setStudents(response.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (user?.role === 'student') {
          response = await api.get(`prototypes/?student=${user.id}&page=${currentPage}&page_size=${ITEMS_PER_PAGE}`);
        } else if (user?.role === 'staff') {
          response = await api.get(`prototypes/?department=${user.department?.id}&page=${currentPage}&page_size=${ITEMS_PER_PAGE}${departmentFilter ? `&department_filter=${departmentFilter}` : ''}`);
        } else if (user?.role === 'admin') {
          response = await api.get(`prototypes/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}${departmentFilter ? `&department_filter=${departmentFilter}` : ''}`);
        } else {
          setPrototypes([]);
          setTotalItems(0);
          setLoading(false);
          return;
        }
        setPrototypes(response.data.results || response.data || []);
        setTotalItems(response.data.count || 0);
      } catch (error) {
        console.error("Error fetching prototypes:", error);
        setError("Failed to load prototypes.");
        setPrototypes([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, currentPage, departmentFilter]);

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.username : 'N/A';
  };

  const handleViewClick = (prototypeId) => {
    setSelectedPrototypeIdForView(prototypeId);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedPrototypeIdForView(null);
  };

  const handleEditClick = (prototypeId) => {
    setSelectedPrototypeIdForEdit(prototypeId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPrototypeIdForEdit(null);
  };

  const handlePrototypeUpdated = () => {
    setCurrentPage(1);
  };

  const handleReviewClick = (prototypeId) => {
    setSelectedPrototypeIdForReview(prototypeId);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedPrototypeIdForReview(null);
    setShowReviewModal(false);
  };

  const handleAssignStorageClick = (prototypeId) => {
    setSelectedPrototypeForAssignStorage(prototypeId);
    setShowAssignStorageModal(true);
  };

  const handleCloseAssignStorageModal = () => {
    setShowAssignStorageModal(false);
    setSelectedPrototypeForAssignStorage(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDepartmentChange = (departmentId) => {
    setDepartmentFilter(departmentId);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (loading) return <p className="mt-5 text-center">Loading prototypes...</p>;
  if (error) return <p className="mt-5 text-center text-danger">{error}</p>;

  return (
    <div className='dashboard-container'>
      <DashboardSidebar />
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <DashboardHeader user={user} />
            <h2 className="mb-4">Review Prototypes</h2>

            {(user?.role === 'staff' || user?.role === 'admin') && (
              <div className="mb-3">
                <div className="dropdown">
                  <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownDepartment" data-bs-toggle="dropdown" aria-expanded="false">
                    Filter by Department {departmentFilter && departments.find(dept => dept.id === departmentFilter)?.name ? `(${departments.find(dept => dept.id === departmentFilter)?.name})` : ''}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="dropdownDepartment">
                    <li><button className="dropdown-item" onClick={() => handleDepartmentChange('')}>All Departments</button></li>
                    {departments.map(department => (
                      <li key={department.id}><button className="dropdown-item" onClick={() => handleDepartmentChange(department.id)}>{department.name}</button></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <table className="table table-striped table-bordered table-hover table-responsive">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Project Name</th>
                  <th>Project Barcode No</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prototypes.length > 0 ? (
                  prototypes.map((prototype) => (
                    <tr key={prototype.id}>
                      <td>{prototype.student}</td>
                      <td>{prototype.username || getStudentName(prototype.student)}</td>
                      <td>{prototype.title || 'Untitled'}</td>
                      <td>{prototype.barcode || 'N/A'}</td>
                      <td>
                        {prototype.status === 'submitted_not_reviewed' && <span>Submitted (Not Reviewed)</span>}
                        {prototype.status === 'submitted_reviewed' && <span className="text-success">Submitted (Reviewed)</span>}
                      </td>
                      <td>
                        <button className="btn btn-info btn-sm me-2" onClick={() => handleViewClick(prototype.id)}>
                          <Eye /> View
                        </button>

                        {user?.role === 'student' && prototype.student === user.id && (
                          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(prototype.id)}>
                            <PencilSquare /> Edit
                          </button>
                        )}

                        {(user?.role === 'staff' || user?.role === 'admin') && (
                          <>
                            <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleReviewClick(prototype.id)}>
                              <ChatDots /> Review
                            </button>

                            <button className="btn btn-secondary btn-sm me-2" onClick={() => handleAssignStorageClick(prototype.id)}>
                              Assign Storage
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      {user?.role === 'student' ? "You haven't submitted any prototypes yet." : "No prototypes found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <ReviewPrototypeModal
              show={showReviewModal}
              onHide={handleCloseReviewModal}
              prototypeId={selectedPrototypeIdForReview}
              onReviewSubmitted={handlePrototypeUpdated}
            />

            {totalPages > 1 && (
              <nav aria-label="Prototype pagination">
                <ul className="pagination justify-content-center mt-3">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(1)}>First</button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(number)}>{number}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>Last</button>
                  </li>
                </ul>
              </nav>
            )}

            <ViewPrototypeModal
              show={showViewModal}
              onHide={handleCloseViewModal}
              prototypeId={selectedPrototypeIdForView}
            />

            <EditPrototypeModal
              show={showEditModal}
              onHide={handleCloseEditModal}
              prototypeId={selectedPrototypeIdForEdit}
              onPrototypeUpdated={handlePrototypeUpdated}
            />

            <AssignStorageModal
              show={showAssignStorageModal}
              onHide={handleCloseAssignStorageModal}
              prototypeId={selectedPrototypeForAssignStorage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPrototypes;