import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/Sidebar';
import DashboardHeader from '../components/Navbar';
import api from '../api/api';
import { Container, Row, Col, Table, Button, Dropdown, Pagination } from 'react-bootstrap';
import { PencilSquare, Eye, CheckCircle } from 'react-bootstrap-icons';
import ViewPrototypeModal from './ViewPrototype';
import EditPrototypeModal from './EditPrototype';

const ITEMS_PER_PAGE = 20;

const ReviewPrototypes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prototypes, setPrototypes] = useState([]);
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

  useEffect(() => {
    fetchUserProfile();
    fetchDepartments();
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
      const response = await api.get("prototypes/departments/");
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error)
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

    fetchData();
  }, [user, currentPage, departmentFilter]);

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
    // After successful update, refresh the prototype list
    setCurrentPage(1);
    // The useEffect hook will automatically refetch the data
  };

  const handleApprove = async (prototypeId) => {
    try {
      await api.patch(`prototypes/${prototypeId}/approve/`);
      setCurrentPage(1);
      // The useEffect hook will automatically refetch the data
    } catch (error) {
      console.error("Error approving prototype:", error);
      setError("Failed to approve prototype.");
    }
  };

  const handleDepartmentChange = (departmentId) => {
    setDepartmentFilter(departmentId);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (loading) return <p className="mt-5 text-center">Loading prototypes...</p>;
  if (error) return <p className="mt-5 text-center text-danger">{error}</p>;

  return (
    <Container fluid>
      <Row className="">
        <Col  className="bg-light">
          <DashboardSidebar />
        </Col>
        <Col md={10} className="">
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
                    <td>{prototype.username}</td>
                    <td>{prototype.title || 'Untitled'}</td>
                    <td>{prototype.barcode || 'N/A'}</td>
                    <td>
                      {prototype.status === 'approved' ? (
                        <span className="text-success">Approved</span>
                      ) : prototype.status === 'rejected' ? (
                        <span className="text-danger">Rejected</span>
                      ) : (
                        prototype.status || 'Pending'
                      )}
                    </td>
                    <td>
                      <Button variant="info" size="sm" className="me-2" onClick={() => handleViewClick(prototype.id)}>
                        <Eye /> View
                      </Button>
                      {user?.role === 'student' && (
                        <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditClick(prototype.id)}>
                          <PencilSquare /> Edit
                        </Button>
                      )}
                      {(user?.role === 'staff' || user?.role === 'admin') && prototype.status !== 'approved' && (
                        <Button variant="success" size="sm" onClick={() => handleApprove(prototype.id)}>
                          <CheckCircle /> Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    {user?.role === 'student' ? 'You haven\'t submitted any prototypes yet.' : 'No prototypes found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

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
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewPrototypes;