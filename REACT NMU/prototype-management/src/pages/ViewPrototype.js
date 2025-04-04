import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const ViewPrototype = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prototype, setPrototype] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrototype = async () => {
      try {
        const response = await api.get(`prototypes/${id}/`);
        setPrototype(response.data);
      } catch (error) {
        console.error("Error fetching prototype:", error);
        alert("Failed to load prototype details.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchPrototype();
  }, [id, navigate]);

  if (loading) return <p>Loading prototype details...</p>;
  if (!prototype) return <p>Prototype not found.</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Prototype Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <p><strong>Title:</strong> {prototype.title}</p>
        <p><strong>Abstract:</strong> {prototype.abstract}</p>
        <p><strong>Department:</strong> {prototype.department?.name || "N/A"}</p>
        <p><strong>Student:</strong> {prototype.student?.email || "N/A"}</p>
        <p><strong>Academic Year:</strong> {prototype.academic_year}</p>
        <p><strong>Supervisor:</strong> {prototype.supervisor?.email || "N/A"}</p>
        <p><strong>Has Physical Prototype:</strong> {prototype.has_physical_prototype ? "Yes" : "No"}</p>
        <p><strong>Status:</strong> {prototype.status === "submitted_not_reviewed" ? "Submitted (Not Reviewed)" : "Submitted (Reviewed)"}</p>
        <p><strong>Barcode:</strong> {prototype.barcode || "N/A"}</p>
        <p><strong>Storage Location:</strong> {prototype.storage_location || "N/A"}</p>
        <p><strong>Feedback:</strong> {prototype.feedback || "No feedback yet"}</p>
        <p><strong>Submission Date:</strong> {new Date(prototype.submission_date).toLocaleString()}</p>
      </div>

      {/* Display Report Download Link */}
      {prototype.attachment?.report && (
        <p className="mt-4">
          <strong>Report:</strong>
          <a href={prototype.attachment.report} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">
            Download Report
          </a>
        </p>
      )}

      {/* Display Source Code Download Link */}
      {prototype.attachment?.source_code && (
        <p>
          <strong>Source Code:</strong>
          <a href={prototype.attachment.source_code} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">
            Download Source Code
          </a>
        </p>
      )}

      <button 
        onClick={() => navigate("/dashboard")} 
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ViewPrototype;
