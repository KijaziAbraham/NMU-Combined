// components/ViewPrototypeModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import api from "../api/api";

const ViewPrototype = ({ show, onHide, prototypeId }) => {
  const [prototype, setPrototype] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrototype = async () => {
      if (!prototypeId) return;
      setLoading(true);
      setError(null);
      setPrototype(null);
      try {
        const response = await api.get(`prototypes/${prototypeId}/`);
        setPrototype(response.data);
      } catch (error) {
        console.error("Error fetching prototype:", error);
        setError("Failed to load prototype details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrototype();
  }, [prototypeId]);

  if (!show) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Prototype Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Loading prototype details...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : prototype ? (
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Title:</strong> {prototype.title}</p>
            <p><strong>Abstract:</strong> {prototype.abstract}</p>
            <p><strong>Department:</strong> {prototype.department?.name || "N/A"}</p>
            <p><strong>Student:</strong> {prototype.student?.email || "N/A"}</p>
            <p><strong>Academic Year:</strong> {prototype.academic_year}</p>
            <p><strong>Supervisor:</strong> {prototype.supervisor?.email || "N/A"}</p>
            <p><strong>Has Physical Prototype:</strong> {prototype.has_physical_prototype ? "Yes" : "No"}</p>
            <p><strong>Status:</strong> {prototype.status === "submitted_not_reviewed" ? "Submitted (Not Reviewed)" : prototype.status}</p>
            <p><strong>Barcode:</strong> {prototype.barcode || "N/A"}</p>
            <p><strong>Storage Location:</strong> {prototype.storage_location || "N/A"}</p>
            <p><strong>Feedback:</strong> {prototype.feedback || "No feedback yet"}</p>
            <p><strong>Submission Date:</strong> {new Date(prototype.submission_date).toLocaleString()}</p>

            {prototype.attachment?.report && (
              <>
                <p><strong>Report:</strong></p>
                <p>
                  <a href={prototype.attachment.report} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                    Download Report
                  </a>
                </p>
              </>
            )}

            {prototype.attachment?.source_code && (
              <>
                <p><strong>Source Code:</strong></p>
                <p>
                  <a href={prototype.attachment.source_code} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                    Download Source Code
                  </a>
                </p>
              </>
            )}
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewPrototype;