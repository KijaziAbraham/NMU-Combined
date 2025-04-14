import React, { useState, useEffect } from 'react';
import api from '../api/api';
import DashboardHeader from '../components/Navbar';
import DashboardSidebar from '../components/Sidebar';
import { Container, Row, Col, Card} from 'react-bootstrap';

const ViewAllPrototype = () => {
  const [allPrototypes, setAllPrototypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllPrototypes = async () => {
      setLoading(true);
      setError(null);
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

  if (loading) {
    return <p className="mt-5 text-center">Loading prototypes...</p>;
  }

  if (error) {
    return <p className="mt-5 text-center text-danger">{error}</p>;
  }

  return (
    <Container fluid>
      <Row className="">
        <Col  className="bg-light">
          <DashboardSidebar />
        </Col>
        <Col md={10} className="">
          <DashboardHeader />
          <h2 className="mb-4">All Prototypes</h2>

          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {allPrototypes.length > 0 ? (
              allPrototypes.map((prototype) => (
                <Col key={prototype.id}>
                  <Card style={{ borderLeft: '4px solid #64A293' }}>
                    <Card.Body>
                      <Card.Title>{prototype.title || 'Untitled'}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        Student: {prototype.student_name || 'N/A'}
                      </Card.Subtitle>
                      <Card.Text>
                        {prototype.abstract?.substring(0, 100)}
                        {prototype.abstract?.length > 100 && '...'}
                      </Card.Text>
                      <Card.Link href={`/prototypes/${prototype.id}`}>View Details</Card.Link>
                      {/* Add more details or actions as needed */}
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              Array.from({ length: 10 }).map((_, index) => ( // Display 10 placeholder items if no prototypes
                <Col key={`empty-${index}`}>
                  <div className="prototype-item placeholder-item" style={{ height: '85px', borderLeft: '4px solid #64A293', paddingLeft: '10px', backgroundColor: '#FFFFFF' }}>
                    <p className="mb-0 text-muted">No prototype</p>
                  </div>
                </Col>
              ))
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewAllPrototype;