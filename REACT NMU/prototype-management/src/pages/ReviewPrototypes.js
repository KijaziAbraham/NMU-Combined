import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import api from '../api/api';
import { Container, Row, Col, Table, Button, Dropdown, Pagination } from 'react-bootstrap';
import { PencilSquare, Eye, CheckCircle, ChatDots } from 'react-bootstrap-icons';
import ViewPrototypeModal from './ViewPrototype';
import EditPrototypeModal from './EditPrototype';
import ReviewPrototypeModal from "../components/ReviewPrototypeModal";
import AssignStorageModal from '../components/AssignStorageModal'; 

const ITEMS_PER_PAGE = 20;

const ReviewPrototypes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prototypes, setPrototypes] = useState([]);
  const [students, setStudents] = useState([]); //  added
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
  const [showAssignStorageModal, setShowAssignStorageModal] = useState(false);  // New modal state
  const [selectedPrototypeForAssignStorage, setSelectedPrototypeForAssignStorage] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
    fetchStudents(); //  fetch students
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
      const response = await api.get("users/students/"); //  correct API endpoint
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

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (loading) return <p className="mt-5 text-center">Loading prototypes...</p>;
  if (error) return <p className="mt-5 text-center text-danger">{error}</p>;


  const handleDepartmentChange = (departmentId) => {
    setDepartmentFilter(departmentId);
    setCurrentPage(1);
  };

  // const handlePageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  // };

  // const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (loading) return <p className="mt-5 text-center">Loading prototypes...</p>;
  if (error) return <p className="mt-5 text-center text-danger">{error}</p>;

  return (
    <Container fluid>
      <Row>
        <Col className="bg-light">
          <DashboardSidebar />
        </Col>
        <Col md={10}>
          <DashboardHeader user={user} />
          <h2 className="mb-4">Review Prototypes</h2>

          {(user?.role === 'staff' || user?.role === 'admin') && (
            <div className="mb-3">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-department">
                  Filter by Department {departmentFilter && departments.find(dept => dept.id === departmentFilter)?.name ? `(${departments.find(dept => dept.id === departmentFilter)?.name})` : ''}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleDepartmentChange('')}>All Departments</Dropdown.Item>
                  {departments.map(department => (
                    <Dropdown.Item key={department.id} onClick={() => handleDepartmentChange(department.id)}>
                      {department.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}

          <Table striped bordered hover responsive>
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
  <Button
    variant="info"
    size="sm"
    className="me-2"
    onClick={() => handleViewClick(prototype.id)}
  >
    <Eye /> View
  </Button>

  {user?.role === 'student' && prototype.student === user.id && (
  <Button
    variant="warning"
    size="sm"
    className="me-2"
    onClick={() => handleEditClick(prototype.id)}
  >
    <PencilSquare /> Edit
  </Button>
)}


  {(user?.role === 'staff' || user?.role === 'admin') && (
    <>
      <Button
        variant="outline-primary"
        size="sm"
        className="me-2"
        onClick={() => handleReviewClick(prototype.id)}
      >
        <ChatDots /> Review
      </Button>

      <Button
        variant="secondary"
        size="sm"
        className="me-2"
        onClick={() => handleAssignStorageClick(prototype.id)}
      >
      Assign Storage
      </Button>
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
          </Table>

          <ReviewPrototypeModal
            show={showReviewModal}
            onHide={handleCloseReviewModal}
            prototypeId={selectedPrototypeIdForReview}
            onReviewSubmitted={handlePrototypeUpdated}
          />

          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-3">
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                  {number}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
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

          <Pagination className="justify-content-center mt-3">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                {number}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewPrototypes;
