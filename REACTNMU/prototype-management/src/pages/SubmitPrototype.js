import '../pages/Materials/css/SubmitPrototypeModal.css';
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
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("user/profile/");
        setUserRole(response.data.role);
        setUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setError("Failed to load user information");
      }
    };

    if (show) {
      fetchUser();
    }
  }, [show]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userRole === "admin") {
          const studentsRes = await api.get("users/students/");
          setStudents(studentsRes.data || []);
        }
        
        const [deptsRes, supsRes] = await Promise.all([
          api.get("departments/"),
          api.get("users/supervisors/")
        ]);
        
        setDepartments(deptsRes.data || []);
        setSupervisors(supsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load required data");
      }
    };

    if (userRole && show) {
      fetchData();
    }
  }, [userRole, show]);

  useEffect(() => {
    const fetchStudentLevel = async (studentId) => {
      try {
        const response = await api.get(`users/${studentId}/`);
        setStudentLevel(response.data.level || "");
      } catch (error) {
        console.error("Error fetching student level:", error);
        setStudentLevel("");
      }
    };

    if (userRole === "student" && userId) {
      fetchStudentLevel(userId);
    } else if (userRole === "admin" && selectedStudent) {
      fetchStudentLevel(selectedStudent);
    } else {
      setStudentLevel("");
    }
  }, [userRole, userId, selectedStudent]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

      if (onPrototypeSubmitted) {
        onPrototypeSubmitted();
      }
      
      resetForm();
      onHide();
    } catch (error) {
      console.error("Error submitting prototype:", error);
      setError(error.response?.data?.message || "Failed to submit prototype");
    } finally {
      setLoading(false);
    }
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
    setError(null);
  };

  const handleFileChange = (setter) => (e) => {
    setter(e.target.files[0] || null);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="classic-modal" onExited={resetForm}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">
          <i className="fas fa-plus-circle mr-2"></i>
          {userRole === "admin" ? "Create New Prototype" : "Submit Your Prototype"}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Form onSubmit={handleSubmit} className="prototype-form">
          {/* Basic Information Section */}
          <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-info-circle mr-2"></i>Basic Information
            </h5>
            
            <Form.Group className="form-group">
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your project title"
                required
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label>Abstract</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Describe your project (minimum 100 characters)"
                required
              />
            </Form.Group>
          </div>

          {/* Academic Details Section */}
          <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-graduation-cap mr-2"></i>Academic Details
            </h5>
            
            <div className="form-row">
              <Form.Group className="form-group col-md-12">
                <Form.Label>Academic Year</Form.Label>
                <Form.Control
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2023/2024"
                  required
                />
              </Form.Group>

              <Form.Group className="form-group col-md-12">
                <Form.Label>Department</Form.Label>
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
            </div>

            {userRole === "admin" && (
              <div className="form-row">
                <Form.Group className="form-group col-md-12">
                  <Form.Label>Assign to Student</Form.Label>
                  <Form.Select 
                    value={selectedStudent} 
                    onChange={handleStudentChange} 
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.username || student.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="form-group col-md-12">
                  <Form.Label>Student Level</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={studentLevel} 
                    readOnly 
                    placeholder="Will auto-populate"
                  />
                </Form.Group>
              </div>
            )}

            <Form.Group className="form-group">
              <Form.Label>Supervisor</Form.Label>
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
          </div>

          {/* Additional Information Section */}
          <div className="form-section">
            <h5 className="section-title">
              <i className="fas fa-cubes mr-2"></i>Additional Information
            </h5>
            
            <Form.Group className="">
              <Form.Check
                type="checkbox"
                id="physical-prototype"
                label="This project includes a physical prototype"
                checked={hasPhysicalPrototype}
                onChange={(e) => setHasPhysicalPrototype(e.target.checked)}
              />
            </Form.Group>

            <div className="form-row">
              <Form.Group className="form-group col-md-12">
                <Form.Label>Project Report</Form.Label>
                <div className="file-upload">
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange(setReport)}
                  />
                  <small className="form-text">
                    PDF or Word document (max 10MB)
                  </small>
                  {report && (
                    <div className="file-selected">
                      <i className="fas fa-check-circle text-success"></i>
                      {report.name}
                    </div>
                  )}
                </div>
              </Form.Group>

              <Form.Group className="form-group col-md-12">
                <Form.Label>Source Code</Form.Label>
                <div className="file-upload">
                  <Form.Control
                    type="file"
                    accept=".zip,.rar"
                    onChange={handleFileChange(setSourceCode)}
                  />
                  <small className="form-text">
                    Compressed archive (ZIP/RAR, max 20MB)
                  </small>
                  {sourceCode && (
                    <div className="file-selected">
                      <i className="fas fa-check-circle text-success"></i>
                      {sourceCode.name}
                    </div>
                  )}
                </div>
              </Form.Group>
            </div>
          </div>

          <div className="form-actions">
            <Button 
              variant="outline-secondary" 
              onClick={onHide} 
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
             style={{backgroundColor:'#64A293',border:'none'}}
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  {userRole === "admin" ? "Create Prototype" : "Submit Prototype"}
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SubmitPrototypeModal;