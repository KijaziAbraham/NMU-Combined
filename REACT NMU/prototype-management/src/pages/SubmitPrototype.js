import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const SubmitPrototype = () => {
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
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting prototype:", error);
      alert("Error submitting prototype: " + JSON.stringify(error.response?.data, null, 2));
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>{userRole === "admin" ? "Add Prototype (Admin)" : "Submit New Prototype"}</h2>
      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Abstract:</label>
        <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} required />

        <label>Department:</label>
        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} required>
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        <label>Academic Year:</label>
        <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required />

        <label>Supervisor:</label>
        <select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} required>
          <option value="">Select Supervisor</option>
          {supervisors.map((sup) => (
            <option key={sup.id} value={sup.id}>{sup.username || sup.email}</option>
          ))}
        </select>

        <label>
          <input type="checkbox" checked={hasPhysicalPrototype} onChange={(e) => setHasPhysicalPrototype(e.target.checked)} />
          Has Physical Prototype?
        </label>

        <label>Report:</label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setReport(e.target.files[0] || null)} />

        <label>Source Code:</label>
        <input type="file" accept=".zip,.rar" onChange={(e) => setSourceCode(e.target.files[0] || null)} />

        {userRole === "admin" && (
          <>
            <label>Assign to Student:</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required>
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.username || student.email}</option>
              ))}
            </select>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : userRole === "admin" ? "Add Prototype" : "Submit Prototype"}
        </button>
      </form>
    </div>
  );
};

export default SubmitPrototype;
