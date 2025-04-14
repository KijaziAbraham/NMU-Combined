import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../api/api";

const EditPrototype = ({ show, onHide, prototypeId, onPrototypeUpdated }) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [hasPhysicalPrototype, setHasPhysicalPrototype] = useState(false);
  const [report, setReport] = useState(null);
  const [sourceCode, setSourceCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialReport, setInitialReport] = useState(null);
  const [initialSourceCode, setInitialSourceCode] = useState(null);

  useEffect(() => {
    const fetchPrototype = async () => {
      if (!prototypeId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`prototypes/${prototypeId}/`);
        setTitle(response.data.title || "");
        setAbstract(response.data.abstract || "");
        setHasPhysicalPrototype(response.data.has_physical_prototype || false);
        setInitialReport(response.data.attachment?.report || null);
        setInitialSourceCode(response.data.attachment?.source_code || null);
        setReport(null); // Reset file inputs on open
        setSourceCode(null);
      } catch (error) {
        console.error("Error fetching prototype:", error);
        setError("Failed to load prototype details for editing.");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchPrototype();
    } else {
      // Reset state when modal is closed
      setTitle("");
      setAbstract("");
      setHasPhysicalPrototype(false);
      setReport(null);
      setSourceCode(null);
      setError(null);
      setLoading(false);
    }
  }, [prototypeId, show]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();

    formData.append("title", title);
    formData.append("abstract", abstract);
    formData.append("has_physical_prototype", hasPhysicalPrototype);

    if (report) {
      formData.append("attachment.report", report);
    }
    if (sourceCode) {
      formData.append("attachment.source_code", sourceCode);
    }

    try {
      await api.patch(`prototypes/${prototypeId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPrototypeUpdated();
      onHide();
    } catch (error) {
      console.error("Error updating prototype:", error);
      setError(error.response?.data?.detail || "Failed to update prototype.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Prototype</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Loading prototype details for editing...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Title:</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Abstract:</Form.Label>
              <Form.Control
                as="textarea"
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={3}
                required
              />
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
              <Form.Label>Report:</Form.Label>
              {initialReport && (
                <p>
                  Current Report: <a href={initialReport} target="_blank" rel="noopener noreferrer">View</a> (Selecting a new file will replace the current one)
                </p>
              )}
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={(e) => setReport(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Source Code:</Form.Label>
              {initialSourceCode && (
                <p>
                  Current Source Code: <a href={initialSourceCode} target="_blank" rel="noopener noreferrer">View</a> (Selecting a new file will replace the current one)
                </p>
              )}
              <Form.Control
                type="file"
                accept=".zip,.rar,.tar,.tar.gz"
                onChange={(e) => setSourceCode(e.target.files[0])}
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Prototype"}
            </Button>
            {error && <p className="mt-3 text-danger">{error}</p>}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPrototype;