import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

const SubmitPrototypeModal = ({ show, onHide, onPrototypeSubmitted }) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [hasPhysicalPrototype, setHasPhysicalPrototype] = useState(false);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [report, setReport] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentLevel, setStudentLevel] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userRole === "admin") {
      fetchStudents();
    }
    fetchDepartments();
    fetchSupervisors();
  }, [userRole]);

  useEffect(() => {
    if (userRole === "student" && userId) {
      fetchStudentLevel(userId);
    }
  }, [userRole, userId]);

  const fetchUser = async () => {
    try {
      const response = await api.get("user/profile/");
      setUserRole(response.data.role);
      setUserId(response.data.id);
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("users/students/");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("departments/");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await api.get("users/supervisors/");
      setSupervisors(response.data);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const fetchStudentLevel = async (studentId) => {
    try {
      const response = await api.get(`users/${studentId}/`);
      setStudentLevel(response.data.level || "");
    } catch (error) {
      console.error("Error fetching student level:", error);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    if (studentId) {
      fetchStudentLevel(studentId);
    } else {
      setStudentLevel("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("abstract", abstract);
      formData.append("has_physical_prototype", hasPhysicalPrototype);
      formData.append("department", selectedDepartment);
      formData.append("academic_year", academicYear);
      formData.append("supervisor", supervisor);

      if (report) formData.append("attachment.report", report);
      if (sourceCode) formData.append("attachment.source_code", sourceCode);

      formData.append("student", userRole === "admin" ? selectedStudent : userId);

      const response = await api.post("prototypes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(`Prototype submitted successfully! ID: ${response.data.id}`);
      onHide();
      if (onPrototypeSubmitted) onPrototypeSubmitted();
      resetForm();
    } catch (error) {
      console.error("Error submitting prototype:", error);
      alert("Error submitting prototype: " + JSON.stringify(error.response?.data, null, 2));
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setAbstract("");
    setHasPhysicalPrototype(false);
    setAcademicYear("");
    setSupervisor("");
    setSelectedStudent("");
    setSelectedDepartment("");
    setReport(null);
    setSourceCode(null);
    setStudentLevel("");
    setLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <div style={{ width: "600px", marginLeft: "1rem", backgroundColor: "white" }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {userRole === "admin" ? "Create New Prototype (Admin)" : "Submit New Prototype"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>Abstract</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>Academic Year</Form.Label>
              <Form.Control
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>Department</Form.Label>
              <Form.Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {userRole === "admin" && (
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#64A293" }}>Assign to Student</Form.Label>
                <Form.Select value={selectedStudent} onChange={handleStudentChange} required>
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.username || student.email}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {studentLevel && (
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#64A293" }}>Student Level</Form.Label>
                <Form.Control type="text" value={studentLevel} readOnly />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>Supervisor</Form.Label>
              <Form.Select
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                required
              >
                <option value="">Select Supervisor</option>
                {supervisors.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.username || sup.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Has Physical Prototype?"
                checked={hasPhysicalPrototype}
                onChange={(e) => setHasPhysicalPrototype(e.target.checked)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>
                Report (PDF, DOC, DOCX)
              </Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setReport(e.target.files[0] || null)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#64A293" }}>
                Source Code (ZIP, RAR)
              </Form.Label>
              <Form.Control
                type="file"
                accept=".zip,.rar"
                onChange={(e) => setSourceCode(e.target.files[0] || null)}
              />
            </Form.Group>

            <Button
              variant="primary"
              style={{
                backgroundColor: "#64A293",
                padding: "12px",
                border: "none",
                borderRadius: "10px",
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : userRole === "admin" ? "Add Prototype" : "Submit Prototype"}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={onHide}>
            Close
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

const SubmitPrototype = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handlePrototypeSubmitted = () => {
    console.log("Prototype submitted successfully from modal!");
  };

  return (
    <div>
      <Button
        variant="success"
        style={{
          backgroundColor: "#64A293",
          padding: "12px",
          border: "none",
          borderRadius: "10px",
        }}
        onClick={handleShowModal}
      >
        ADD PROTOTYPE
      </Button>

      <SubmitPrototypeModal
        show={showModal}
        onHide={handleCloseModal}
        onPrototypeSubmitted={handlePrototypeSubmitted}
      />
    </div>
  );
};

export default SubmitPrototype;
