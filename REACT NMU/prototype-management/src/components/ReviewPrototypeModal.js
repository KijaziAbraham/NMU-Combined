import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import api from "../api/api";

const ReviewPrototypeModal = ({ show, onHide, prototypeId, onReviewSubmitted }) => {
  const [prototype, setPrototype] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prototypeId && show) {
      fetchPrototypeDetails();
    }
  }, [prototypeId, show]);

  const fetchPrototypeDetails = async () => {
    try {
      const response = await api.get(`prototypes/${prototypeId}/`);
      setPrototype(response.data);
    } catch (err) {
      console.error("Failed to fetch prototype details", err);
      setError("Failed to load prototype details.");
    }
  };

  const handleSubmitReview = async () => {
    if (!feedback.trim()) {
      alert("Please provide feedback before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`prototypes/${prototypeId}/review_prototype/`, { feedback });

      alert("Review submitted successfully.");
      setFeedback("");
      onReviewSubmitted(); // Refresh prototype list if needed
      onHide();
    } catch (err) {
      console.error("Failed to submit review", err);
      setError("Failed to submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Review Prototype</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <p className="text-danger">{error}</p>}
        {prototype ? (
          <>
            <p><strong>Title:</strong> {prototype.title}</p>
            <p><strong>Abstract:</strong> {prototype.abstract}</p>
            <p><strong>Student:</strong> {prototype.username || prototype.student || "N/A"}</p>
            <p><strong>Current Status:</strong> {prototype.status}</p>

            <Form.Group controlId="feedbackTextarea">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your review/feedback here..."
              />
            </Form.Group>
          </>
        ) : (
          <p>Loading prototype details...</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmitReview} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewPrototypeModal;
