import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardHeader from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';
import { Container, Row, Col, Card, Modal, Button } from 'react-bootstrap';

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
    <Container fluid>
      <Row>
        <Col className="bg-light">
          <DashboardSidebar />
        </Col>
        <Col md={10}>
          <DashboardHeader />
          <h2 className="mb-4">All Prototypes</h2>

          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {allPrototypes.length > 0 ? (
              allPrototypes.map((prototype) => (
                <Col key={prototype.id}>
                  <Card
                    style={{ borderLeft: '4px solid #64A293', cursor: 'pointer' }}
                    onClick={() => handlePrototypeClick(prototype)}
                  >
                    <Card.Body>
                      <Card.Title>{prototype.title || 'Untitled'}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        Student: {prototype.username || getStudentName(prototype.student)}
                      </Card.Subtitle>
                      <Card.Text>
                        {prototype.abstract?.substring(0, 100)}
                        {prototype.abstract?.length > 100 && '...'}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              Array.from({ length: 10 }).map((_, index) => (
                <Col key={`empty-${index}`}>
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
                </Col>
              ))
            )}
          </Row>

          {/* Modal for Prototype Details */}
          <Modal show={!!selectedPrototype} onHide={handleCloseModal} fullscreen>
  <Modal.Header closeButton>
    <Modal.Title>
      {selectedPrototype?.title || 'Prototype Details'}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
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
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCloseModal}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

        </Col>
      </Row>
    </Container>
  );
};

export default ViewAllPrototype;
