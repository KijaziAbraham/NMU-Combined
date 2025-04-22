import React from "react";
import { useNavigate } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const DashboardNavbar = ({ user, searchTerm, setSearchTerm, handleShowSubmitModal, userRole }) => {
  const navigate = useNavigate();
  
  return (
    <Navbar expand="lg" className="bg-body-light mb-2" style={{borderBottom:"2px solid gray"}}>
      <Container fluid>
        <Navbar.Brand className="text-capitalize text-bg" style={{fontSize:'1.5rem',color:'#64A293'}}>
        Logged in as :  {user ? `${user.role}` : "User"}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            {/* You can add navigation items here if needed */}
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search prototypes..."
              className="me-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-success">Search</Button>
          </Form>
          {(userRole === 'student' || userRole === 'admin' || userRole === 'staff') && (
            <Button 
              variant="success" 
              className="ms-2" 
              onClick={handleShowSubmitModal}
            >
              <BsPlusLg />
            </Button>
          )}

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DashboardNavbar;